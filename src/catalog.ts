// Generated from the HuntAPI OpenAPI document. Do not edit by hand.

import type { EndpointEntry } from "./types.js";

export const MODE: "catalog" | "tools" = "tools";

export const CATALOG: readonly EndpointEntry[] = [
  {
    name: "audio_download",
    title: "Audio Download",
    path: "/v1/audio/download",
    methods: ["GET", "POST"],
    description:
      "Audio Download. Download audio from a URL via HuntAPI and receive a job id. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "URL to download audio from.",
      },
      {
        name: "download_type",
        type: "string",
        required: false,
        description:
          "Desired download type. Supported values: audio (default).",
        default: "audio",
      },
      {
        name: "max_duration",
        type: "number",
        required: false,
        description:
          "Maximum duration of the downloaded content in seconds. If the audio is longer than this value, only the content up to this duration will be downloaded.",
      },
      {
        name: "audio_quality",
        type: "string",
        required: false,
        description: "Desired audio quality.",
        default: "best",
      },
      {
        name: "audio_format",
        type: "string",
        required: false,
        description: "Desired output format for the audio.",
        default: "mp3",
      },
      {
        name: "webhook_url",
        type: "string",
        required: false,
        description:
          "URL of the webhook where results will be sent. When specified, the system will attempt to send the response to this URL up to 3 times with a 5-second delay between each attempt. The results will be sent as a POST request.",
      },
      {
        name: "webhook_authorization",
        type: "string",
        required: false,
        description:
          "Authorization header for the webhook. This parameter allows you to add authentication to your webhook endpoint.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "jobs",
    title: "Jobs",
    path: "/v1/jobs/{id}",
    methods: ["GET"],
    description:
      "Jobs. Poll status, progress (0–100), and result of an async HuntAPI job.",
    params: [
      {
        name: "id",
        type: "string",
        required: true,
        description:
          "Job UUID returned as job_id by async endpoints such as /v1/video/download and /v1/audio/download.",
      },
    ],
  },
  {
    name: "media_metadata",
    title: "Media Metadata",
    path: "/v1/media/metadata",
    methods: ["GET"],
    description:
      "Media Metadata. Extract metadata from a media URL without downloading the file. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "Media URL to inspect (YouTube, Instagram, TikTok, Vimeo, X, Facebook, Twitch, Reddit, etc.).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "stats",
    title: "Stats",
    path: "/v1/stats",
    methods: ["GET"],
    description:
      "Stats. Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per account: HTTP 403 means contact support to activate it.",
    params: [
      {
        name: "engine",
        type: "string",
        required: false,
        description:
          "API family to check, for example video. Provide at least engine or path.",
      },
      {
        name: "path",
        type: "string",
        required: false,
        description:
          "Specific endpoint to check, for example /v1/video/download. If you also pass engine, use an endpoint from that API.",
      },
    ],
  },
  {
    name: "usage",
    title: "Usage",
    path: "/v1/usage",
    methods: ["GET"],
    description:
      "Usage. Retrieve real-time usage statistics and credit balance for your Huntapi account.",
    params: [],
  },
  {
    name: "video_download",
    title: "Video Download",
    path: "/v1/video/download",
    methods: ["GET", "POST"],
    description: "Video Download. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "Video URL to download.",
      },
      {
        name: "download_type",
        type: "string",
        required: false,
        description: "Desired download type. You have three options:",
        default: "audio_video",
      },
      {
        name: "max_duration",
        type: "number",
        required: false,
        description:
          "Maximum duration of the downloaded content in seconds. If the video/audio is longer than this value, only the content up to this duration will be downloaded.",
      },
      {
        name: "video_quality",
        type: "string",
        required: false,
        description: "Desired video quality. Available options:",
        default: "best",
      },
      {
        name: "video_format",
        type: "string",
        required: false,
        description: "Desired output format for the video. Available options:",
        default: "mp4",
      },
      {
        name: "webhook_url",
        type: "string",
        required: false,
        description:
          "URL of the webhook where results will be sent. When specified, the system will attempt to send the response to this URL up to 3 times with a 5-second delay between each attempt. The results will be sent as a POST request.",
      },
      {
        name: "webhook_authorization",
        type: "string",
        required: false,
        description:
          "Authorization header for the webhook. This parameter allows you to add authentication to your webhook endpoint. This value will be included in the Authorization header when making the webhook request to your server.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
];
