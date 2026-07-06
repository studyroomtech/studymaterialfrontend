// Constants for the `useDownload` orchestration hook (Req 6.7, 6.8).

// HTTP status returned by `POST /api/materials/:id/download` when the presented
// Access Token is missing, expired, or invalid. It causes the hook to clear the
// stored token and re-open the Download Gate to re-collect name + email before
// the download proceeds (Req 6.7).
export const DOWNLOAD_UNAUTHORIZED_STATUS = 401;
