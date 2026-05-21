from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os
import tempfile
import json

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

router = APIRouter(
    prefix="/video",
    tags=["Video Generate"],
)


MAGNIFIC_MODELS = {
    "kling-2.6-motion": {
        "platform": "magnific",
        "name": "Kling 2.6 Motion Control Pro",
        "badge": "Recommended",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-v2-6-motion-control-pro",
        "status_url": "https://api.magnific.com/v1/ai/image-to-video/kling-v2-6/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": True,
    },
    "kling-2.6-std-motion": {
        "platform": "magnific",
        "name": "Kling 2.6 Motion Control STD",
        "badge": "Standard",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-v2-6-motion-control-std",
        "status_url": "https://api.magnific.com/v1/ai/image-to-video/kling-v2-6/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": True,
    },
    "kling-2.6-pro": {
        "platform": "magnific",
        "name": "Kling 2.6 Pro",
        "badge": "High Quality",
        "generate_url": "https://api.magnific.com/v1/ai/image-to-video/kling-v2-6-pro",
        "status_url": "https://api.magnific.com/v1/ai/image-to-video/kling-v2-6/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": False,
    },
    "kling-v3-pro": {
        "platform": "magnific",
        "name": "Kling 3 Pro",
        "badge": "Latest",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-v3-pro",
        "status_url": "https://api.magnific.com/v1/ai/video/kling-v3/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": False,
    },
    "kling-v3-std": {
        "platform": "magnific",
        "name": "Kling 3 Standard",
        "badge": "Value",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-v3-std",
        "status_url": "https://api.magnific.com/v1/ai/video/kling-v3/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": False,
    },
    "kling-v3-motion-pro": {
        "platform": "magnific",
        "name": "Kling 3 Motion Control Pro",
        "badge": "Motion",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-v3-motion-control-pro",
        "status_url": "https://api.magnific.com/v1/ai/video/kling-v3-motion-control-pro/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": True,
    },
    "kling-4k-i2v": {
        "platform": "magnific",
        "name": "Kling 4K I2V",
        "badge": "4K",
        "generate_url": "https://api.magnific.com/v1/ai/video/kling-4k-i2v",
        "status_url": "https://api.magnific.com/v1/ai/video/kling-4k-i2v/{task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": False,
    },
}


KIE_MODELS = {
    "kie-kling-2.6-i2v": {
        "platform": "kie",
        "name": "KIE Kling 2.6 Image to Video",
        "badge": "KIE I2V",
        "kie_model": "kling-2.6/image-to-video",
        "generate_url": "https://api.kie.ai/api/v1/jobs/createTask",
        "status_url": "https://api.kie.ai/api/v1/jobs/recordInfo?taskId={task_id}",
        "durations": [5, 10],
        "requires_image": True,
        "requires_video": False,
    },
    "kie-kling-2.6-motion": {
        "platform": "kie",
        "name": "KIE Kling 2.6 Motion Control",
        "badge": "KIE Motion",
        "kie_model": "kling-2.6/motion-control",
        "generate_url": "https://api.kie.ai/api/v1/jobs/createTask",
        "status_url": "https://api.kie.ai/api/v1/jobs/recordInfo?taskId={task_id}",
        "durations": [5, 10, 15],
        "requires_image": True,
        "requires_video": True,
    },
}


VIDEO_MODELS = {
    **MAGNIFIC_MODELS,
    **KIE_MODELS,
}


class StatusRequest(BaseModel):
    model: str
    task_id: str
    api_key: str


def log_step(message: str, value=None):
    print("--------------------------------------", flush=True)
    print(message, flush=True)
    if value is not None:
        print(value, flush=True)
    print("--------------------------------------", flush=True)


def safe_json(response: httpx.Response):
    try:
        return response.json()
    except Exception:
        return {"raw_text": response.text}


def get_data(payload: dict):
    data = payload.get("data")
    if isinstance(data, dict):
        return data
    return {}


def get_result(payload: dict):
    data = get_data(payload)

    result = data.get("result")
    if isinstance(result, dict):
        return result

    result = payload.get("result")
    if isinstance(result, dict):
        return result

    return {}


def parse_json_string(value):
    if isinstance(value, dict):
        return value

    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            return {}

    return {}


def extract_task_id(payload: dict):
    data = get_data(payload)

    return (
        payload.get("task_id")
        or payload.get("taskId")
        or payload.get("id")
        or data.get("task_id")
        or data.get("taskId")
        or data.get("id")
    )


def extract_status(payload: dict):
    data = get_data(payload)

    status = (
        payload.get("status")
        or payload.get("state")
        or data.get("status")
        or data.get("state")
        or ""
    )

    return str(status).lower()


def extract_video_url(payload: dict):
    data = get_data(payload)
    result = get_result(payload)

    generated = data.get("generated")
    if isinstance(generated, list) and len(generated) > 0:
        first_generated = generated[0]
        if isinstance(first_generated, str):
            return first_generated
        if isinstance(first_generated, dict):
            return first_generated.get("url") or first_generated.get("video_url")

    result_generated = result.get("generated")
    if isinstance(result_generated, list) and len(result_generated) > 0:
        first_result_generated = result_generated[0]
        if isinstance(first_result_generated, str):
            return first_result_generated
        if isinstance(first_result_generated, dict):
            return first_result_generated.get("url") or first_result_generated.get(
                "video_url"
            )

    videos = data.get("videos")
    if isinstance(videos, list) and len(videos) > 0:
        first_video = videos[0]
        if isinstance(first_video, str):
            return first_video
        if isinstance(first_video, dict):
            return first_video.get("url") or first_video.get("video_url")

    output = data.get("output")
    if isinstance(output, list) and len(output) > 0:
        first_output = output[0]
        if isinstance(first_output, str):
            return first_output
        if isinstance(first_output, dict):
            return first_output.get("url") or first_output.get("video_url")

    result_json = parse_json_string(data.get("resultJson"))
    result_urls = result_json.get("resultUrls")
    if isinstance(result_urls, list) and len(result_urls) > 0:
        return result_urls[0]

    result_url = result_json.get("resultUrl")
    if isinstance(result_url, str) and result_url:
        return result_url

    result_video_url = result_json.get("video_url") or result_json.get("url")
    if isinstance(result_video_url, str) and result_video_url:
        return result_video_url

    return (
        payload.get("video_url")
        or payload.get("url")
        or payload.get("result_url")
        or payload.get("output_url")
        or payload.get("download_url")
        or data.get("video_url")
        or data.get("url")
        or data.get("result_url")
        or data.get("output_url")
        or data.get("download_url")
        or result.get("video_url")
        or result.get("url")
        or result.get("result_url")
        or result.get("output_url")
        or result.get("download_url")
    )


def ensure_cloudinary_env():
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise HTTPException(
            status_code=500,
            detail="CLOUDINARY_CLOUD_NAME belum di-set di file .env",
        )

    if not os.getenv("CLOUDINARY_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="CLOUDINARY_API_KEY belum di-set di file .env",
        )

    if not os.getenv("CLOUDINARY_API_SECRET"):
        raise HTTPException(
            status_code=500,
            detail="CLOUDINARY_API_SECRET belum di-set di file .env",
        )


async def upload_file_to_cloudinary(file: UploadFile, resource_type: str):
    suffix = os.path.splitext(file.filename or "")[1] or ""
    tmp_path = None

    try:
        contents = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            tmp_path = temp_file.name

        if resource_type == "video":
            log_step("[CLOUDINARY] Upload video mulai", file.filename)
            result = cloudinary.uploader.upload_large(
                tmp_path,
                resource_type="video",
                folder="tools-ku/videos",
            )
        else:
            log_step("[CLOUDINARY] Upload image mulai", file.filename)
            result = cloudinary.uploader.upload(
                tmp_path,
                resource_type="image",
                folder="tools-ku/images",
            )

        secure_url = result.get("secure_url")

        if not secure_url:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Cloudinary tidak mengembalikan secure_url",
                    "raw": result,
                },
            )

        log_step("[CLOUDINARY] Upload selesai", secure_url)

        return {
            "secure_url": secure_url,
            "public_id": result.get("public_id"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal upload ke Cloudinary: {str(e)}",
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


def build_kie_payload(
    selected_model: dict,
    duration: int,
    prompt: Optional[str],
    uploaded_image_url: Optional[str],
    uploaded_video_url: Optional[str],
):
    kie_model = selected_model["kie_model"]

    if kie_model == "kling-2.6/image-to-video":
        return {
            "model": kie_model,
            "input": {
                "prompt": prompt or "",
                "image_urls": [uploaded_image_url],
                "duration": str(duration),
                "sound": False,
            },
        }

    if kie_model == "kling-2.6/motion-control":
        return {
            "model": kie_model,
            "input": {
                "prompt": prompt or "",
                "input_urls": [uploaded_image_url],
                "video_urls": [uploaded_video_url],
                "mode": "720p",
                "character_orientation": "image",
            },
        }

    raise HTTPException(
        status_code=400,
        detail="Model KIE tidak valid",
    )


def build_magnific_payload(
    model: str,
    duration: int,
    aspect_ratio: str,
    prompt: Optional[str],
    uploaded_image_url: Optional[str],
    uploaded_video_url: Optional[str],
):
    payload = {
        "duration": duration,
        "aspect_ratio": aspect_ratio,
    }

    if prompt:
        payload["prompt"] = prompt

    if uploaded_image_url:
        payload["image_url"] = uploaded_image_url

    if uploaded_video_url:
        payload["video_url"] = uploaded_video_url

    if "motion" in model:
        payload["character_orientation"] = "video"
        payload["cfg_scale"] = 0.5

    return payload


@router.get("/models")
def get_all_models():
    return {
        "success": True,
        "models": VIDEO_MODELS,
    }


@router.get("/magnific/models")
def get_magnific_models():
    return {
        "success": True,
        "models": MAGNIFIC_MODELS,
    }


@router.get("/kie/models")
def get_kie_models():
    return {
        "success": True,
        "models": KIE_MODELS,
    }


@router.post("/generate")
async def generate_video(
    platform: str = Form(...),
    api_key: str = Form(...),
    model: str = Form(...),
    duration: int = Form(...),
    aspect_ratio: str = Form("16:9"),
    prompt: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
):
    log_step(
        "[GENERATE] Request masuk",
        {
            "platform": platform,
            "model": model,
            "duration": duration,
            "aspect_ratio": aspect_ratio,
            "prompt": prompt,
            "photo": photo.filename if photo else None,
            "video": video.filename if video else None,
        },
    )

    ensure_cloudinary_env()

    platform = platform.lower().strip()

    if platform not in ["magnific", "kie"]:
        raise HTTPException(
            status_code=400,
            detail="Platform tidak valid. Pilihan: magnific atau kie",
        )

    if model not in VIDEO_MODELS:
        raise HTTPException(
            status_code=400,
            detail="Model video tidak valid",
        )

    selected_model = VIDEO_MODELS[model]

    if selected_model["platform"] != platform:
        raise HTTPException(
            status_code=400,
            detail=f"Model ini hanya bisa dipakai untuk platform {selected_model['platform']}",
        )

    if duration not in selected_model["durations"]:
        raise HTTPException(
            status_code=400,
            detail=f"Durasi tidak didukung model ini. Pilihan: {selected_model['durations']}",
        )

    if not api_key.strip():
        raise HTTPException(
            status_code=400,
            detail="API key wajib diisi",
        )

    if not prompt and not photo and not video:
        raise HTTPException(
            status_code=400,
            detail="Minimal isi prompt atau upload foto/video",
        )

    if selected_model["requires_image"] and not photo:
        raise HTTPException(
            status_code=400,
            detail="Model ini membutuhkan upload foto",
        )

    if selected_model["requires_video"] and not video:
        raise HTTPException(
            status_code=400,
            detail="Model ini membutuhkan upload video reference",
        )

    uploaded_image_url = None
    uploaded_video_url = None

    if photo:
        image_upload = await upload_file_to_cloudinary(photo, "image")
        uploaded_image_url = image_upload["secure_url"]

    if video:
        video_upload = await upload_file_to_cloudinary(video, "video")
        uploaded_video_url = video_upload["secure_url"]

    if platform == "magnific":
        headers = {
            "x-magnific-api-key": api_key.strip(),
            "Content-Type": "application/json",
        }

        payload = build_magnific_payload(
            model=model,
            duration=duration,
            aspect_ratio=aspect_ratio,
            prompt=prompt,
            uploaded_image_url=uploaded_image_url,
            uploaded_video_url=uploaded_video_url,
        )

        log_prefix = "[MAGNIFIC]"

    else:
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
        }

        payload = build_kie_payload(
            selected_model=selected_model,
            duration=duration,
            prompt=prompt,
            uploaded_image_url=uploaded_image_url,
            uploaded_video_url=uploaded_video_url,
        )

        log_prefix = "[KIE]"

    async with httpx.AsyncClient(timeout=240) as client:
        log_step(f"{log_prefix} Kirim request ke", selected_model["generate_url"])
        log_step(f"{log_prefix} Payload", payload)

        submit_response = await client.post(
            selected_model["generate_url"],
            headers=headers,
            json=payload,
        )

        submit_json = safe_json(submit_response)

        log_step(f"{log_prefix} Submit status code", submit_response.status_code)
        log_step(f"{log_prefix} Submit response", submit_json)

        if submit_response.status_code >= 400:
            raise HTTPException(
                status_code=submit_response.status_code,
                detail={
                    "message": f"Request ke {platform.upper()} gagal",
                    "provider_response": submit_json,
                    "payload_sent": payload,
                },
            )

        task_id = extract_task_id(submit_json)
        immediate_video_url = extract_video_url(submit_json)

        if immediate_video_url:
            return {
                "success": True,
                "status": "completed",
                "message": "Video berhasil dibuat",
                "data": {
                    "platform": platform,
                    "model": model,
                    "model_name": selected_model["name"],
                    "duration": duration,
                    "aspect_ratio": aspect_ratio,
                    "task_id": task_id,
                    "video_url": immediate_video_url,
                    "uploaded_image_url": uploaded_image_url,
                    "uploaded_video_url": uploaded_video_url,
                    "submit_raw": submit_json,
                },
            }

        if not task_id:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": f"Task ID tidak ditemukan dari response {platform.upper()}",
                    "raw": submit_json,
                    "payload_sent": payload,
                },
            )

        log_step(f"{log_prefix} Task dibuat", task_id)

        return {
            "success": True,
            "status": "submitted",
            "message": f"Task berhasil dikirim ke {platform.upper()}",
            "data": {
                "platform": platform,
                "model": model,
                "model_name": selected_model["name"],
                "duration": duration,
                "aspect_ratio": aspect_ratio,
                "prompt": prompt,
                "photo_filename": photo.filename if photo else None,
                "video_filename": video.filename if video else None,
                "uploaded_image_url": uploaded_image_url,
                "uploaded_video_url": uploaded_video_url,
                "task_id": task_id,
                "status_url": selected_model["status_url"].format(task_id=task_id),
                "submit_raw": submit_json,
            },
        }


@router.post("/status")
async def get_video_status(request: StatusRequest):
    model = request.model
    task_id = request.task_id
    api_key = request.api_key

    if model not in VIDEO_MODELS:
        raise HTTPException(
            status_code=400,
            detail="Model video tidak valid",
        )

    if not api_key.strip():
        raise HTTPException(
            status_code=400,
            detail="API key wajib diisi",
        )

    selected_model = VIDEO_MODELS[model]
    platform = selected_model["platform"]
    status_url = selected_model["status_url"].format(task_id=task_id)

    if platform == "magnific":
        headers = {
            "x-magnific-api-key": api_key.strip(),
        }
        log_prefix = "[MAGNIFIC]"
    else:
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
        }
        log_prefix = "[KIE]"

    async with httpx.AsyncClient(timeout=60) as client:
        log_step(f"{log_prefix} Cek status", status_url)

        status_response = await client.get(
            status_url,
            headers=headers,
        )

        status_json = safe_json(status_response)

        log_step(f"{log_prefix} Status response code", status_response.status_code)
        log_step(f"{log_prefix} Status response", status_json)

        if status_response.status_code >= 400:
            raise HTTPException(
                status_code=status_response.status_code,
                detail={
                    "message": f"Gagal cek status {platform.upper()}",
                    "task_id": task_id,
                    "raw": status_json,
                },
            )

        status = extract_status(status_json)
        video_url = extract_video_url(status_json)

        if platform == "kie":
            is_completed = status in ["success", "completed", "succeeded", "done"]
            is_failed = status in ["fail", "failed", "error", "cancelled"]
        else:
            is_completed = status in ["completed", "succeeded", "success", "done"]
            is_failed = status in ["failed", "error", "cancelled"]

        if is_completed and not video_url:
            log_step(
                f"{log_prefix} Completed tapi video_url belum kebaca",
                status_json,
            )

        return {
            "success": True,
            "task_id": task_id,
            "platform": platform,
            "model": model,
            "model_name": selected_model["name"],
            "status": status,
            "is_completed": is_completed,
            "is_failed": is_failed,
            "video_url": video_url,
            "raw": status_json,
        }