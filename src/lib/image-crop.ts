export async function cropImageToCover(
    file: File,
    targetWidth: 1200,
    targetHeight: 400,
    initialQuality = 0.85
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
            try {
                const targetRatio = targetWidth / targetHeight
                const sourceRatio = img.width / img.height

                let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height
                
                // Center crop to match wide cover rectangle
                if (sourceRatio > targetRatio) {
                    // image is wider than target, crop the sides
                    sWidth = Math.round(img.height * targetRatio)
                    sx = Math.round((img.width - sWidth) / 2)
                } else if (sourceRatio < targetRatio) {
                    // image is taller than target, crop the top and bottom
                    sHeight = Math.round(img.width / targetRatio)
                    sy = Math.round((img.height - sHeight) / 2)
                }

                const canvas = document.createElement('canvas')
                canvas.width = targetWidth
                canvas.height = targetHeight
                
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }

                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight)

                const baseName = file.name.replace(/\.[^/.]+$/, "") || 'banner'
                const maxBytes = 2 * 1024 * 1024 // 2 MB

                const encodeWithQuality = (quality: number) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to encode image'))
                                return
                            }
                            if (blob.size > maxBytes && quality > 0.45) {
                                encodeWithQuality(Number((quality - 0.1).toFixed(2)))
                                return
                            }
                            const croppedFile = new File([blob], `${baseName}-cover.jpg`, { 
                                type: 'image/jpeg',
                            })
                            resolve(croppedFile)
                        },
                        'image/jpeg',
                        quality
                    )
                }
                encodeWithQuality(initialQuality)
            } catch (err) {
                reject(err)
            } finally {
                URL.revokeObjectURL(objectUrl)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to load image for cropping'))
        }

        img.src = objectUrl

    })
}