export async function achicarJpeg(archivo: File, maxAncho = 1280) {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, maxAncho / bitmap.width);
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("No pude achicar la foto.");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();
  const dataUrl = lienzo.toDataURL("image/jpeg", 0.82);
  return {
    base64: dataUrl.replace(/^data:image\/jpeg;base64,/, ""),
    mediaType: "image/jpeg" as const,
  };
}
