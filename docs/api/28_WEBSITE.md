# 28 — Website Video Management APIs

**Base URL:** `/api/v1/website/videos`  
**Auth:** Noted per endpoint

---

## 1. GET `/api/v1/public/website/videos`

> **Access:** Public (no auth)  
> _(Documented in [02_PUBLIC.md](./02_PUBLIC.md))_

---

## 2. POST `/api/v1/website/videos`

> **Access:** `ADMIN` only  
> Upload a new website video.  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | file | ✅ (or `videoKey`) | Video file (MP4, WebM) |
| `videoKey` | string | ✅ (or `video`) | Pre-uploaded file key |
| `thumbnail` | file | optional | Thumbnail image |
| `thumbnailKey` | string | optional | Pre-uploaded thumbnail key |
| `section` | string | ✅ | `HOME`, `PORTFOLIO`, `ABOUT`, etc. |
| `title` | string | optional | Video title |
| `description` | string | optional | Video description |

### Response `201 Created`
```json
{
  "id": "019514a2-7e3b-7000-8000-000000000040",
  "section": "HOME",
  "title": "About Girik Marine",
  "description": "Introduction to our certification services",
  "video_url": "https://storage.girik.com/videos/intro.mp4",
  "thumbnail_url": "https://storage.girik.com/thumbnails/intro.jpg",
  "uploaded_by": "019514a2-7e3b-7000-8000-000000000001",
  "created_at": "2026-03-05T18:00:00.000Z",
  "updated_at": "2026-03-05T18:00:00.000Z"
}
```

---

## 3. PUT `/api/v1/website/videos/:id`

> **Access:** `ADMIN` only  
> Update video details or replace video/thumbnail.  
> **Content-Type:** `multipart/form-data`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | file | optional | Replacement video |
| `thumbnail` | file | optional | Replacement thumbnail |
| `section` | string | optional | Update section |
| `title` | string | optional | Update title |
| `description` | string | optional | Update description |

### Response `200 OK`
```json
{
  "id": "uuid",
  "section": "HOME",
  "title": "Updated Title",
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "updated_at": "2026-03-06T10:00:00.000Z"
}
```

---

## 4. DELETE `/api/v1/website/videos/:id`

> **Access:** `ADMIN` only

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `204 No Content`
No body.
