"use client";
// MaterialThumbnail — a material's cover: no images → the generated default
// cover art, one image → that image, several → an autoplaying carousel.
import { buildApiUrl } from "@/hooks/api/apiClient";
import { classNames } from "@/utils/classnames";
import Carousel from "../Carousel/Carousel";
import {
  MaterialCoverArt,
  resolveCoverVariant,
} from "../MaterialCoverArt/MaterialCoverArt";
import styles from "./MaterialThumbnail.module.scss";
import type { MaterialThumbnailProps } from "./MaterialThumbnail.types";

function MaterialThumbnailView({
  materialId,
  thumbnails,
  className,
  uid,
  alt = "",
}: MaterialThumbnailProps) {
  const images = thumbnails ?? [];

  if (images.length === 0) {
    return (
      <MaterialCoverArt
        variant={resolveCoverVariant(materialId)}
        uid={uid ?? materialId}
        className={className}
      />
    );
  }

  // Images load eagerly: lazy-loading would defer the off-screen slides until
  // they slide in (a blank frame). Thumbnails are cached permanently anyway.
  const slides = images.map((thumbnail, position) => (
    <img
      key={thumbnail.id}
      className={styles.image}
      src={buildApiUrl(thumbnail.url)}
      alt={alt.length > 0 ? `${alt} ${position + 1}` : ""}
      decoding="async"
    />
  ));

  if (slides.length === 1) {
    return <div className={classNames(styles.fill, className)}>{slides[0]}</div>;
  }
  return <Carousel items={slides} className={classNames(styles.fill, className)} />;
}

export default MaterialThumbnailView;
