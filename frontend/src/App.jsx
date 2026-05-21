import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
const CHECK_STATUS_COOLDOWN_SECONDS = 60;
const ACCESS_SESSION_KEY = "gealgeol_dashboard_unlocked";
const WHATSAPP_CONTACT_URL =
  "https://wa.me/6285695552849?text=Halo%20saya%20mau%20akses%20GealGeol%20Generator";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    shortName: "FB",
    url: "https://www.facebook.com/share/1AtwHh3Rmd/",
    type: "facebook",
  },
  {
    name: "Instagram",
    shortName: "IG",
    url: "https://www.instagram.com/dhikcihhuy?igsh=MWpodnRtMTFvYWU0Yg==",
    type: "instagram",
  },
  {
    name: "Telegram",
    shortName: "TG",
    url: "https://t.me/markasgarapan",
    type: "telegram",
  },
];

const MODEL_OPTIONS = [
  {
    platform: "magnific",
    value: "kling-2.6-motion",
    label: "Kling 2.6 Motion Control Pro",
    badge: "Recommended",
    motion: true,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-2.6-std-motion",
    label: "Kling 2.6 Motion Control Std",
    badge: "Standard",
    motion: true,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-2.6-pro",
    label: "Kling 2.6 Pro",
    badge: "High Quality",
    motion: false,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-v3-pro",
    label: "Kling 3 Pro",
    badge: "Latest",
    motion: false,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-v3-std",
    label: "Kling 3 Standard",
    badge: "Value",
    motion: false,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-v3-motion-pro",
    label: "Kling 3 Motion Control Pro",
    badge: "Motion",
    motion: true,
    durations: ["5", "10", "15"],
  },
  {
    platform: "magnific",
    value: "kling-4k-i2v",
    label: "Kling 4K I2V",
    badge: "4K",
    motion: false,
    durations: ["5", "10", "15"],
  },
  {
    platform: "kie",
    value: "kie-kling-2.6-i2v",
    label: "KIE Kling 2.6 Image to Video",
    badge: "KIE I2V",
    motion: false,
    durations: ["5", "10"],
  },
  {
    platform: "kie",
    value: "kie-kling-2.6-motion",
    label: "KIE Kling 2.6 Motion Control",
    badge: "KIE Motion",
    motion: true,
    durations: ["5", "10", "15"],
  },
];

function SocialIcon({ type }) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 8.7V7.1c0-.8.2-1.3 1.4-1.3h1.6V3.1c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.3H7.4v3h2.9V21h3.5v-9.3h2.9l.5-3h-3z" />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.8 2.8h8.4c2.8 0 5 2.2 5 5v8.4c0 2.8-2.2 5-5 5H7.8c-2.8 0-5-2.2-5-5V7.8c0-2.8 2.2-5 5-5zm0 2c-1.7 0-3 1.3-3 3v8.4c0 1.7 1.3 3 3 3h8.4c1.7 0 3-1.3 3-3V7.8c0-1.7-1.3-3-3-3H7.8zm4.2 3.1a4.1 4.1 0 1 1 0 8.2 4.1 4.1 0 0 1 0-8.2zm0 2a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zm4.4-2.4a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1z" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 3.5A11 11 0 0 0 3.3 16.8L2 22l5.3-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Zm4.9-6.7c-.3-.1-1.6-.8-1.9-.8-.2-.1-.4-.1-.6.2s-.7.8-.9 1c-.1.1-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.3c-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.1.1-.3 0-.5s-.6-1.5-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4s-1 1-.9 2.3c0 1.3 1 2.6 1.1 2.8.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.6-.7 1.8-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.7 4.1 18.4 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.3L5.8 13.4.8 11.8c-1.1-.3-1.1-1.1.2-1.6L20.4 2.7c.9-.3 1.7.2 1.3 1.4z" />
    </svg>
  );
}

function formatFileSize(file) {
  if (!file?.size) return "-";

  const mb = file.size / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  const kb = file.size / 1024;
  return `${kb.toFixed(2)} KB`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function extractVideoUrlFromAny(data) {
  if (!data) return "";

  if (data?.video_url) return data.video_url;
  if (data?.data?.video_url) return data.data.video_url;

  const rawGenerated = data?.raw?.data?.generated;
  if (Array.isArray(rawGenerated) && rawGenerated.length > 0) {
    return rawGenerated[0];
  }

  const statusRawGenerated = data?.status_raw?.data?.generated;
  if (Array.isArray(statusRawGenerated) && statusRawGenerated.length > 0) {
    return statusRawGenerated[0];
  }

  const dataStatusRawGenerated = data?.data?.status_raw?.data?.generated;
  if (
    Array.isArray(dataStatusRawGenerated) &&
    dataStatusRawGenerated.length > 0
  ) {
    return dataStatusRawGenerated[0];
  }

  const rawResultGenerated = data?.raw?.data?.result?.generated;
  if (Array.isArray(rawResultGenerated) && rawResultGenerated.length > 0) {
    return rawResultGenerated[0];
  }

  const submitRawGenerated = data?.data?.submit_raw?.data?.generated;
  if (Array.isArray(submitRawGenerated) && submitRawGenerated.length > 0) {
    return submitRawGenerated[0];
  }

  const rawResultJson = data?.raw?.data?.resultJson;
  if (typeof rawResultJson === "string" && rawResultJson.trim()) {
    try {
      const parsedResult = JSON.parse(rawResultJson);

      if (
        Array.isArray(parsedResult?.resultUrls) &&
        parsedResult.resultUrls.length > 0
      ) {
        return parsedResult.resultUrls[0];
      }

      if (parsedResult?.resultUrl) {
        return parsedResult.resultUrl;
      }

      if (parsedResult?.video_url) {
        return parsedResult.video_url;
      }

      if (parsedResult?.url) {
        return parsedResult.url;
      }
    } catch {
      return "";
    }
  }

  const dataResultJson = data?.data?.status_raw?.data?.resultJson;
  if (typeof dataResultJson === "string" && dataResultJson.trim()) {
    try {
      const parsedResult = JSON.parse(dataResultJson);

      if (
        Array.isArray(parsedResult?.resultUrls) &&
        parsedResult.resultUrls.length > 0
      ) {
        return parsedResult.resultUrls[0];
      }

      if (parsedResult?.resultUrl) {
        return parsedResult.resultUrl;
      }

      if (parsedResult?.video_url) {
        return parsedResult.video_url;
      }

      if (parsedResult?.url) {
        return parsedResult.url;
      }
    } catch {
      return "";
    }
  }

  return "";
}

function AccessGate({ onUnlock }) {
  const [accessCode, setAccessCode] = useState("");
  const [agreeWarning, setAgreeWarning] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");

  async function handleVerifyAccess() {
    if (!accessCode.trim()) {
      setAccessError("Access code wajib diisi.");
      return;
    }

    if (!agreeWarning) {
      setAccessError("Centang persetujuan terlebih dahulu.");
      return;
    }

    setAccessLoading(true);
    setAccessError("");

    try {
      const response = await fetch(`${API_BASE_URL}/access/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_code: accessCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data?.detail === "string") {
          throw new Error(data.detail);
        }

        if (data?.detail?.message) {
          throw new Error(data.detail.message);
        }

        throw new Error("Access code salah atau tidak aktif.");
      }

      sessionStorage.setItem(ACCESS_SESSION_KEY, "true");
      onUnlock();
    } catch (err) {
      setAccessError(err.message || "Access code salah atau tidak aktif.");
    } finally {
      setAccessLoading(false);
    }
  }

  return (
    <main className="app access-app">
      <section className="access-shell">
        <div className="access-card">
          <div className="access-brand">
            <span className="access-logo">G</span>
            <div>
              <p className="eyebrow">Private Access</p>
              <h1>GealGeol Generator</h1>
              <p>Create by Dhikcihhuy</p>
            </div>
          </div>

          <div className="access-warning">
            <strong>PERINGATAN</strong>
            <p>
              Access code tidak boleh disebar, dijual ulang, atau dibagikan ke
              pihak lain.
            </p>
            <p>
              Jika ditemukan tindakan penyalahgunaan, pembagian kode, atau
              penggunaan tidak wajar, akses akan kami banned permanen tanpa
              pengembalian dana.
            </p>
          </div>

          <label className="field access-field">
            <span>Access Code</span>
            <input
              type="password"
              placeholder="Masukkan access code"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setAccessError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !accessLoading) {
                  handleVerifyAccess();
                }
              }}
              autoComplete="off"
              disabled={accessLoading}
            />
          </label>

          <label className="access-check">
            <input
              type="checkbox"
              checked={agreeWarning}
              onChange={(e) => {
                setAgreeWarning(e.target.checked);
                setAccessError("");
              }}
              disabled={accessLoading}
            />
            <span>
              Saya setuju untuk tidak menyebarkan access code dan memahami bahwa
              pelanggaran dapat menyebabkan banned permanen.
            </span>
          </label>

          {accessError && <div className="error-box">{accessError}</div>}

          <button
            className="access-btn"
            type="button"
            onClick={handleVerifyAccess}
            disabled={accessLoading || !agreeWarning}
          >
            {accessLoading ? "Checking Access..." : "Unlock Dashboard"}
          </button>

          <div className="access-footer">
            <p className="access-footer-text">
              Belum punya akses? <strong>Lifetime access 10k.</strong>
            </p>

            <a
              href={WHATSAPP_CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="access-contact-btn"
            >
              <span>→</span>
              Hubungi Sekarang
              <span className="access-contact-wa">
                <SocialIcon type="whatsapp" />
                WhatsApp
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ onLogout }) {
  const stopPollingRef = useRef(false);

  const [platform, setPlatform] = useState("magnific");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("kling-2.6-pro");
  const [duration, setDuration] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [prompt, setPrompt] = useState("");
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState("idle");
  const [error, setError] = useState("");
  const [generateResult, setGenerateResult] = useState(null);
  const [taskId, setTaskId] = useState("");
  const [checkCount, setCheckCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkCooldown, setCheckCooldown] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  const platformModelOptions = useMemo(() => {
    return MODEL_OPTIONS.filter((item) => item.platform === platform);
  }, [platform]);

  const selectedModel = useMemo(() => {
    return MODEL_OPTIONS.find((item) => item.value === model);
  }, [model]);

  const isMotionModel = Boolean(selectedModel?.motion);
  const resultVideoUrl = extractVideoUrlFromAny(generateResult);

  const availableDurations = selectedModel?.durations || ["5", "10", "15"];
  const safeDuration = availableDurations.includes(duration)
    ? duration
    : availableDurations[0];

  const photoPreviewUrl = useMemo(() => {
    if (!photo) return "";
    return URL.createObjectURL(photo);
  }, [photo]);

  const videoPreviewUrl = useMemo(() => {
    if (!video) return "";
    return URL.createObjectURL(video);
  }, [video]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  useEffect(() => {
    const shouldRunTimer =
      loading ||
      checkingStatus ||
      processStatus === "submitted" ||
      processStatus === "processing";

    if (!shouldRunTimer || resultVideoUrl) return;

    const interval = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, checkingStatus, processStatus, resultVideoUrl]);

  useEffect(() => {
    if (checkCooldown <= 0) return;

    const interval = setInterval(() => {
      setCheckCooldown((value) => {
        if (value <= 1) return 0;
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [checkCooldown]);

  function getDefaultModelForPlatform(nextPlatform) {
    const firstModel = MODEL_OPTIONS.find(
      (item) => item.platform === nextPlatform
    );

    return firstModel?.value || "kling-2.6-pro";
  }

  function clearResult() {
    stopPollingRef.current = true;
    setGenerateResult(null);
    setTaskId("");
    setCheckCount(0);
    setProcessStatus("idle");
    setError("");
    setShowDebug(false);
    setElapsedSeconds(0);
    setCheckCooldown(0);
    setCheckingStatus(false);
    setLastCheckedAt("");
  }

  function resetForm() {
    stopPollingRef.current = true;

    setPlatform("magnific");
    setApiKey("");
    setModel("kling-2.6-pro");
    setDuration("5");
    setAspectRatio("16:9");
    setPrompt("");
    setPhoto(null);
    setVideo(null);

    setLoading(false);
    setProcessStatus("idle");
    setError("");
    setGenerateResult(null);
    setTaskId("");
    setCheckCount(0);
    setShowDebug(false);
    setElapsedSeconds(0);
    setCheckCooldown(0);
    setCheckingStatus(false);
    setLastCheckedAt("");
  }

  function stopPolling() {
    stopPollingRef.current = true;
    setLoading(false);
    setProcessStatus("stopped");
    setCheckCooldown(0);
    setCheckingStatus(false);
  }

  function handleLogout() {
    stopPollingRef.current = true;
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    onLogout();
  }

  function getReadableError(data, statusCode) {
    if (statusCode === 429) {
      return "Provider sedang membatasi request kamu. Tunggu 10–30 menit sebelum generate lagi.";
    }

    if (statusCode === 401 || statusCode === 403) {
      return "API key tidak valid, expired, atau sedang tidak aktif.";
    }

    if (statusCode === 404) {
      return "Task tidak ditemukan atau endpoint status tidak sesuai.";
    }

    if (statusCode === 504) {
      return "Request timeout. Video mungkin masih diproses, tapi backend terlalu lama menunggu.";
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (data?.detail?.message) {
      return data.detail.message;
    }

    if (data?.detail?.magnific_response?.message) {
      return data.detail.magnific_response.message;
    }

    if (data?.detail?.provider_response?.message) {
      return data.detail.provider_response.message;
    }

    if (data?.detail?.provider_response?.msg) {
      return data.detail.provider_response.msg;
    }

    if (data?.detail?.raw?.message) {
      return data.detail.raw.message;
    }

    if (data?.detail?.raw?.msg) {
      return data.detail.raw.msg;
    }

    if (data?.detail) {
      return JSON.stringify(data.detail, null, 2);
    }

    return "Terjadi error.";
  }

  function validateBeforeGenerate() {
    if (!["magnific", "kie"].includes(platform)) {
      return "Platform tidak valid.";
    }

    if (!apiKey.trim()) {
      return "API key wajib diisi.";
    }

    if (!selectedModel) {
      return "Model tidak valid.";
    }

    if (selectedModel.platform !== platform) {
      return "Model tidak sesuai dengan platform yang dipilih.";
    }

    if (!availableDurations.includes(safeDuration)) {
      return `Durasi tidak didukung model ini. Pilihan: ${availableDurations.join(
        ", "
      )} detik.`;
    }

    if (!prompt.trim() && !photo && !video) {
      return "Minimal isi prompt atau upload foto/video.";
    }

    if (!photo) {
      return "Model ini membutuhkan upload foto.";
    }

    if (isMotionModel && !video) {
      return "Model Motion Control membutuhkan foto dan video reference.";
    }

    return "";
  }

  async function handleCheckStatus() {
    stopPollingRef.current = false;

    const currentTaskId = taskId || generateResult?.data?.task_id;

    if (!currentTaskId) {
      setError("Task ID belum tersedia. Generate video dulu sebelum check status.");
      return;
    }

    if (!apiKey.trim()) {
      setError("API key wajib diisi untuk check status.");
      return;
    }

    if (checkCooldown > 0 || checkingStatus) {
      return;
    }

    setError("");
    setCheckingStatus(true);
    setCheckCooldown(CHECK_STATUS_COOLDOWN_SECONDS);
    setProcessStatus("processing");

    try {
      const response = await fetch(`${API_BASE_URL}/video/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          task_id: currentTaskId,
          api_key: apiKey,
        }),
      });

      const data = await response.json();
      const finalVideoUrl = extractVideoUrlFromAny(data);
      const checkedTime = new Date().toLocaleTimeString();

      setLastCheckedAt(checkedTime);
      setCheckCount((value) => value + 1);

      if (!response.ok) {
        throw new Error(getReadableError(data, response.status));
      }

      if (data.is_failed) {
        setGenerateResult({
          success: true,
          status: data.status || "failed",
          message: `Generate gagal di ${platform.toUpperCase()}`,
          data: {
            task_id: currentTaskId,
            video_url: finalVideoUrl,
            status_raw: data.raw,
          },
        });

        throw new Error(`Generate gagal di ${platform.toUpperCase()}.`);
      }

      setGenerateResult({
        success: true,
        status: data.status || "processing",
        message: `Status ${platform.toUpperCase()}: ${
          data.status || "processing"
        }`,
        data: {
          task_id: currentTaskId,
          video_url: finalVideoUrl,
          status_raw: data.raw,
        },
      });

      if (data.is_completed && finalVideoUrl) {
        setProcessStatus("completed");
        setCheckCooldown(0);
        return;
      }

      if (data.is_completed && !finalVideoUrl) {
        setProcessStatus("processing");
        setError(
          "Status sudah completed, tapi URL video belum kebaca. Cek Debug JSON atau klik Check Status lagi setelah 1 menit."
        );
        return;
      }

      setProcessStatus("processing");
    } catch (err) {
      if (stopPollingRef.current) {
        setProcessStatus("stopped");
        return;
      }

      setError(err.message || "Terjadi error saat check status.");
      setProcessStatus("failed");
    } finally {
      setCheckingStatus(false);
    }
  }

  async function handleGenerate() {
    stopPollingRef.current = false;

    setError("");
    setGenerateResult(null);
    setTaskId("");
    setCheckCount(0);
    setShowDebug(false);
    setElapsedSeconds(0);
    setCheckCooldown(0);
    setCheckingStatus(false);
    setLastCheckedAt("");

    const validationError = validateBeforeGenerate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("api_key", apiKey);
    formData.append("model", model);
    formData.append("duration", safeDuration);
    formData.append("aspect_ratio", aspectRatio);
    formData.append("prompt", prompt);

    if (photo) {
      formData.append("photo", photo);
    }

    if (video) {
      formData.append("video", video);
    }

    setLoading(true);
    setProcessStatus("uploading");

    try {
      const response = await fetch(`${API_BASE_URL}/video/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const returnedTaskId = data?.data?.task_id;
      const returnedVideoUrl = extractVideoUrlFromAny(data);

      if (!response.ok) {
        throw new Error(getReadableError(data, response.status));
      }

      setGenerateResult(data);

      if (returnedTaskId) {
        setTaskId(returnedTaskId);
      }

      if (returnedVideoUrl) {
        setGenerateResult({
          ...data,
          data: {
            ...(data.data || {}),
            video_url: returnedVideoUrl,
          },
        });
        setProcessStatus("completed");
        setCheckCooldown(0);
        setCheckingStatus(false);
        return;
      }

      if (!returnedTaskId) {
        throw new Error("Task ID tidak ditemukan dari response backend.");
      }

      setTaskId(returnedTaskId);
      setProcessStatus("submitted");
    } catch (err) {
      if (stopPollingRef.current) {
        setProcessStatus("stopped");
        setCheckCooldown(0);
        setCheckingStatus(false);
        return;
      }

      setError(err.message || "Terjadi error saat generate.");
      setProcessStatus("failed");
      setCheckCooldown(0);
      setCheckingStatus(false);
    } finally {
      setLoading(false);
    }
  }

  function getResultTitle() {
    if (resultVideoUrl) return "Video Siap";
    if (processStatus === "uploading") return "Uploading File";
    if (processStatus === "submitted") return "Task Terkirim";
    if (processStatus === "processing") return "Menunggu Check Status";
    if (processStatus === "failed") return "Generate Gagal";
    if (processStatus === "stopped") return "Proses Dihentikan";
    return "Hasil Generate";
  }

  function getResultMessage() {
    if (resultVideoUrl) return "Video berhasil dibuat dan siap diputar.";

    if (processStatus === "uploading") {
      return `File sedang diupload ke Cloudinary dan dikirim ke ${platform.toUpperCase()}.`;
    }

    if (processStatus === "submitted") {
      return `Task berhasil dikirim ke ${platform.toUpperCase()}. Klik tombol Refresh / Check Status untuk melihat hasilnya.`;
    }

    if (processStatus === "processing") {
      return "Status terakhir masih diproses. Check status dilakukan manual supaya request tidak numpuk.";
    }

    if (processStatus === "failed") {
      return "Terjadi error saat generate atau check status. Lihat pesan error di panel prompt.";
    }

    if (processStatus === "stopped") {
      return "Proses dihentikan manual. Task di provider mungkin tetap berjalan.";
    }

    return "Video hasil generate nanti muncul di tengah sini.";
  }

  function getStatusLabel() {
    if (resultVideoUrl) return "completed";
    return processStatus;
  }

  function getCurrentStep() {
    if (resultVideoUrl) return "Video selesai dibuat";
    if (processStatus === "uploading") return "Uploading file ke Cloudinary";
    if (processStatus === "submitted") return `Task dikirim ke ${platform.toUpperCase()}`;
    if (processStatus === "processing") return "Menunggu check status manual";
    if (processStatus === "completed") return "Video selesai dibuat";
    if (processStatus === "failed") return "Generate atau check status gagal";
    if (processStatus === "stopped") return "Proses dihentikan";
    return "Menunggu input";
  }

  function getApiKeyPlaceholder() {
    if (platform === "kie") {
      return "Tempel KIE API key / Bearer token di sini";
    }

    return "Tempel API key Magnific di sini";
  }

  const canCheckStatus =
    Boolean(taskId) &&
    !resultVideoUrl &&
    !loading &&
    !checkingStatus &&
    checkCooldown <= 0;

  return (
    <main className="app">
      <section className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">GealGeol Generator</p>
            <h1>Create by Dhikcihhuy</h1>
            <p>
              Private AI video workspace. API key dan hasil generate tidak
              disimpan. Kalau browser refresh, semuanya hilang.
            </p>
          </div>

          <div className="header-actions">
            <div className="private-mode">
              <span />
              GealGeol Generator
            </div>

            <button className="secondary-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="creator-watermark">
          <div className="creator-brand">
            <span className="creator-dot">G</span>
            <div>
              <strong>GealGeol Generator</strong>
              <p>Create by Dhikcihhuy · Follow this social media</p>
            </div>
          </div>

          <div className="social-links">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.type}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                title={item.name}
                className={`social-link social-${item.type}`}
              >
                <SocialIcon type={item.type} />
                <span>{item.shortName}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="toolbar">
          <div className={`status-pill status-${getStatusLabel()}`}>
            <span />
            {getStatusLabel()}
          </div>

          <div className="toolbar-actions">
            {(loading || checkingStatus) && (
              <button
                className="secondary-btn danger"
                type="button"
                onClick={stopPolling}
              >
                Stop Process
              </button>
            )}

            <button
              className="secondary-btn"
              type="button"
              onClick={resetForm}
              disabled={loading || checkingStatus}
            >
              Reset Form
            </button>
          </div>
        </section>

        <section className="top-grid">
          <div className="card upload-card">
            <div className="card-title-row">
              <h2>Upload File</h2>
              <span className="mini-badge">local only</span>
            </div>

            <label className="dropzone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setPhoto(e.target.files?.[0] || null);
                  clearResult();
                }}
                disabled={loading || checkingStatus}
              />

              {photoPreviewUrl ? (
                <img
                  className="file-preview image-preview"
                  src={photoPreviewUrl}
                  alt="Preview foto"
                />
              ) : (
                <div className="drop-icon">🖼️</div>
              )}

              <strong>Foto sumber</strong>
              <p>{photo ? photo.name : "Drag & drop atau klik untuk browse"}</p>

              {photo && (
                <div className="file-meta">
                  <span>{formatFileSize(photo)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPhoto(null);
                      clearResult();
                    }}
                    disabled={loading || checkingStatus}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </label>

            <label className="dropzone">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  setVideo(e.target.files?.[0] || null);
                  clearResult();
                }}
                disabled={loading || checkingStatus}
              />

              {videoPreviewUrl ? (
                <video
                  className="file-preview video-preview"
                  src={videoPreviewUrl}
                  muted
                  controls
                />
              ) : (
                <div className="drop-icon">🎞️</div>
              )}

              <strong>Video reference</strong>
              <p>{video ? video.name : "Drag & drop atau klik untuk browse"}</p>

              {video && (
                <div className="file-meta">
                  <span>{formatFileSize(video)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setVideo(null);
                      clearResult();
                    }}
                    disabled={loading || checkingStatus}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </label>
          </div>

          <div className="card model-card">
            <div className="card-title-row">
              <h2>Pilih Model</h2>
              {isMotionModel && (
                <span className="mini-badge warning">motion</span>
              )}
            </div>

            {isMotionModel && (
              <div className="notice-box">
                Model Motion Control wajib memakai <b>foto sumber</b> dan{" "}
                <b>video reference</b>.
              </div>
            )}

            <div className="model-list">
              {platformModelOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    model === item.value ? "model-item active" : "model-item"
                  }
                  onClick={() => {
                    if (loading || checkingStatus) return;
                    setModel(item.value);
                    setDuration(item.durations[0]);
                    clearResult();
                  }}
                  disabled={loading || checkingStatus}
                >
                  <span>{item.label}</span>
                  <b>{item.badge}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="card prompt-card">
            <div className="card-title-row">
              <h2>Prompt</h2>
              <span className="mini-badge">
                {platform === "kie" ? "KIE AI" : "Magnific"}
              </span>
            </div>

            <label className="field">
              <span>Platform</span>
              <select
                value={platform}
                onChange={(e) => {
                  const nextPlatform = e.target.value;
                  const nextModel = getDefaultModelForPlatform(nextPlatform);

                  setPlatform(nextPlatform);
                  setModel(nextModel);

                  const defaultModel = MODEL_OPTIONS.find(
                    (item) => item.value === nextModel
                  );

                  if (defaultModel?.durations?.[0]) {
                    setDuration(defaultModel.durations[0]);
                  }

                  clearResult();
                }}
                disabled={loading || checkingStatus}
              >
                <option value="magnific">Magnific</option>
                <option value="kie">KIE AI</option>
              </select>
            </label>

            <label className="field">
              <span>API Key</span>
              <input
                type="password"
                placeholder={getApiKeyPlaceholder()}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                }}
                autoComplete="off"
                disabled={loading || checkingStatus}
              />
            </label>

            <label className="field">
              <span>Prompt opsional</span>
              <textarea
                placeholder="Deskripsikan gerakan yang diinginkan..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  clearResult();
                }}
                disabled={loading || checkingStatus}
              />
            </label>

            <div className="double-field">
              <label className="field">
                <span>Durasi</span>
                <select
                  value={safeDuration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    clearResult();
                  }}
                  disabled={loading || checkingStatus}
                >
                  {availableDurations.map((item) => (
                    <option key={item} value={item}>
                      {item} detik
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Aspect Ratio</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => {
                    setAspectRatio(e.target.value);
                    clearResult();
                  }}
                  disabled={loading || checkingStatus || platform === "kie"}
                >
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </select>
              </label>
            </div>

            {platform === "kie" && (
              <div className="notice-box">
                KIE AI menggunakan API key Bearer token. Check status tetap
                manual dan tombol akan cooldown 60 detik setelah diklik.
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <div className="prompt-actions">
              <button
                className="generate-btn"
                type="button"
                onClick={handleGenerate}
                disabled={loading || checkingStatus}
              >
                {loading
                  ? `Processing... ${formatTime(elapsedSeconds)}`
                  : "▷ Generate Video"}
              </button>
            </div>
          </div>
        </section>

        <section className="result-section">
          <div className="result-card">
            <div className="result-empty">
              {resultVideoUrl ? (
                <div className="video-result-wrap">
                  <video
                    className="video-result"
                    src={resultVideoUrl}
                    controls
                    playsInline
                  />

                  <div className="video-actions">
                    <a
                      href={resultVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="video-link"
                    >
                      Buka Video
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="result-icon">
                    {loading || checkingStatus
                      ? "⏳"
                      : processStatus === "failed"
                        ? "⚠️"
                        : processStatus === "stopped"
                          ? "⏹️"
                          : "🎬"}
                  </div>

                  <h2>{getResultTitle()}</h2>
                  <p>{getResultMessage()}</p>
                </>
              )}

              <div className="process-live">
                <div>
                  <span>Elapsed</span>
                  <b>{formatTime(elapsedSeconds)}</b>
                </div>

                <div>
                  <span>Current Step</span>
                  <b>{getCurrentStep()}</b>
                </div>

                <div>
                  <span>Cooldown</span>
                  <b>{checkCooldown ? `${checkCooldown}s` : "Ready"}</b>
                </div>
              </div>

              <div className="manual-status-actions">
                <button
                  className="check-status-btn"
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={!canCheckStatus}
                >
                  {checkingStatus
                    ? "Checking Status..."
                    : checkCooldown > 0
                      ? `Check again in ${checkCooldown}s`
                      : resultVideoUrl
                        ? "Video Completed"
                        : "Refresh / Check Status"}
                </button>

                {taskId && !resultVideoUrl && (
                  <p>
                    Check status manual aktif. Setelah diklik, tombol akan
                    disable selama 60 detik supaya request tidak numpuk.
                  </p>
                )}
              </div>

              <div className="summary">
                <div>
                  <span>Platform</span>
                  <b>{platform === "kie" ? "KIE AI" : "Magnific"}</b>
                </div>
                <div>
                  <span>Model</span>
                  <b>{selectedModel?.label}</b>
                </div>
                <div>
                  <span>Durasi</span>
                  <b>{safeDuration} detik</b>
                </div>
                <div>
                  <span>Status</span>
                  <b>{getStatusLabel()}</b>
                </div>
                <div>
                  <span>Check</span>
                  <b>{checkCount ? `${checkCount}x` : "-"}</b>
                </div>
                <div>
                  <span>Elapsed</span>
                  <b>{formatTime(elapsedSeconds)}</b>
                </div>
                <div>
                  <span>Last Check</span>
                  <b>{lastCheckedAt || "-"}</b>
                </div>
                <div>
                  <span>Task</span>
                  <b>{taskId || "-"}</b>
                </div>
              </div>

              {generateResult && (
                <div className="debug-panel">
                  <button
                    type="button"
                    className="debug-toggle"
                    onClick={() => setShowDebug((value) => !value)}
                  >
                    {showDebug ? "Sembunyikan Debug JSON" : "Lihat Debug JSON"}
                  </button>

                  {showDebug && (
                    <pre className="debug-result">
                      {JSON.stringify(
                        generateResult.data || generateResult,
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(ACCESS_SESSION_KEY) === "true";
  });

  if (!isUnlocked) {
    return <AccessGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return <Dashboard onLogout={() => setIsUnlocked(false)} />;
}

export default App;