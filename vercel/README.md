# Vercel Proxy API

vercel 프록시 서버

## 사용법

배포 후 다음과 같이 사용:

```
https://your-app.vercel.app/api/proxy?url=[TARGET_URL]
```

## API 엔드포인트

- `GET /api/proxy?url=<TARGET_URL>` - URL의 HTML을 프록시로 가져옴

### 예시
```bash
curl "https://your-app.vercel.app/api/proxy?url=[TARGET_URL]"
```
