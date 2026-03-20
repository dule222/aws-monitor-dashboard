import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import {
  S3Client,
  ListBucketsCommand,
  GetBucketLocationCommand,
  ListObjectsV2Command,
  GetBucketAclCommand,
} from "@aws-sdk/client-s3";
import {
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
  ListMetricsCommand,
} from "@aws-sdk/client-cloudwatch";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const ec2Client = new EC2Client(awsConfig);
const s3Client = new S3Client(awsConfig);
const lambdaClient = new LambdaClient(awsConfig);
const cwClient = new CloudWatchClient(awsConfig);
const snsClient = new SNSClient(awsConfig);

// ─── Helper: fetch CloudWatch metric ─────────────────────────────────────────
async function getMetric(namespace, metricName, dimensions, periodMinutes = 60) {
  const endTime = new Date();
  const startTime = new Date(Date.now() - periodMinutes * 60 * 1000);
  const cmd = new GetMetricStatisticsCommand({
    Namespace: namespace,
    MetricName: metricName,
    Dimensions: dimensions,
    StartTime: startTime,
    EndTime: endTime,
    Period: 300,
    Statistics: ["Average"],
  });
  const data = await cwClient.send(cmd);
  const sorted = data.Datapoints.sort(
    (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
  );
  return sorted.map((d) => Math.round(d.Average * 10) / 10);
}

// ─── Helper: SNS alert ────────────────────────────────────────────────────────
async function sendSNSAlert(subject, message) {
  if (!process.env.SNS_TOPIC_ARN) return;
  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: subject,
        Message: message,
      })
    );
    console.log("SNS alert sent:", subject);
  } catch (err) {
    console.error("SNS error:", err.message);
  }
}

// ─── EC2 ──────────────────────────────────────────────────────────────────────
app.get("/api/ec2", async (req, res) => {
  try {
    const data = await ec2Client.send(new DescribeInstancesCommand({}));
    const instances = data.Reservations.flatMap((r) => r.Instances).map((i) => ({
      id: i.InstanceId,
      name: i.Tags?.find((t) => t.Key === "Name")?.Value || i.InstanceId,
      type: i.InstanceType,
      state: i.State.Name,
      region: awsConfig.region,
      launchTime: i.LaunchTime,
      publicIp: i.PublicIpAddress || null,
      privateIp: i.PrivateIpAddress || null,
    }));
    res.json({ success: true, data: instances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// EC2 CPU metric for a specific instance
app.get("/api/ec2/:instanceId/cpu", async (req, res) => {
  try {
    const cpu = await getMetric(
      "AWS/EC2",
      "CPUUtilization",
      [{ Name: "InstanceId", Value: req.params.instanceId }]
    );
    const latest = cpu[cpu.length - 1] ?? 0;

    // Trigger alert if CPU > 80
    if (latest > 80) {
      await sendSNSAlert(
        "⚠️ High CPU Alert",
        `EC2 instance ${req.params.instanceId} CPU is at ${latest}%`
      );
    }

    res.json({ success: true, data: { history: cpu, latest } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── S3 ───────────────────────────────────────────────────────────────────────
app.get("/api/s3", async (req, res) => {
  try {
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));

    const enriched = await Promise.all(
      Buckets.map(async (b) => {
        let region = awsConfig.region;
        let objectCount = 0;
        let isPublic = false;

        try {
          const loc = await s3Client.send(
            new GetBucketLocationCommand({ Bucket: b.Name })
          );
          region = loc.LocationConstraint || "us-east-1";
        } catch (_) {}

        try {
          const objs = await s3Client.send(
            new ListObjectsV2Command({ Bucket: b.Name, MaxKeys: 1000 })
          );
          objectCount = objs.KeyCount || 0;
        } catch (_) {}

        try {
          const acl = await s3Client.send(
            new GetBucketAclCommand({ Bucket: b.Name })
          );
          isPublic = acl.Grants?.some(
            (g) =>
              g.Grantee?.URI ===
              "http://acs.amazonaws.com/groups/global/AllUsers"
          );
        } catch (_) {}

        return {
          name: b.Name,
          creationDate: b.CreationDate,
          region,
          objectCount,
          access: isPublic ? "Public" : "Private",
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Lambda ───────────────────────────────────────────────────────────────────
app.get("/api/lambda", async (req, res) => {
  try {
    const data = await lambdaClient.send(new ListFunctionsCommand({}));
    const functions = data.Functions.map((f) => ({
      name: f.FunctionName,
      runtime: f.Runtime,
      handler: f.Handler,
      memorySize: f.MemorySize,
      timeout: f.Timeout,
      lastModified: f.LastModified,
      codeSize: f.CodeSize,
      state: f.State || "Active",
    }));
    res.json({ success: true, data: functions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lambda invocations + errors from CloudWatch
app.get("/api/lambda/:name/metrics", async (req, res) => {
  try {
    const dims = [{ Name: "FunctionName", Value: req.params.name }];
    const [invocations, errors, duration] = await Promise.all([
      getMetric("AWS/Lambda", "Invocations", dims),
      getMetric("AWS/Lambda", "Errors", dims),
      getMetric("AWS/Lambda", "Duration", dims),
    ]);

    const totalErrors = errors.reduce((a, b) => a + b, 0);
    if (totalErrors > 10) {
      await sendSNSAlert(
        "⚠️ Lambda Error Alert",
        `Function ${req.params.name} has ${totalErrors} errors in the last hour`
      );
    }

    res.json({
      success: true,
      data: { invocations, errors, duration },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Dashboard Summary ────────────────────────────────────────────────────────
app.get("/api/summary", async (req, res) => {
  try {
    const [ec2Res, s3Res, lambdaRes] = await Promise.allSettled([
      ec2Client.send(new DescribeInstancesCommand({})),
      s3Client.send(new ListBucketsCommand({})),
      lambdaClient.send(new ListFunctionsCommand({})),
    ]);

    const instances =
      ec2Res.status === "fulfilled"
        ? ec2Res.value.Reservations.flatMap((r) => r.Instances)
        : [];
    const buckets =
      s3Res.status === "fulfilled" ? s3Res.value.Buckets : [];
    const functions =
      lambdaRes.status === "fulfilled" ? lambdaRes.value.Functions : [];

    res.json({
      success: true,
      data: {
        ec2: {
          total: instances.length,
          running: instances.filter((i) => i.State.Name === "running").length,
          stopped: instances.filter((i) => i.State.Name === "stopped").length,
        },
        s3: { total: buckets.length },
        lambda: { total: functions.length },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Manual Alert Trigger ─────────────────────────────────────────────────────
app.post("/api/alerts/send", async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, error: "subject and message required" });
  }
  try {
    await sendSNSAlert(subject, message);
    res.json({ success: true, message: "Alert sent via SNS" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", region: awsConfig.region }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ AWS Monitor backend running on http://localhost:${PORT}`));
