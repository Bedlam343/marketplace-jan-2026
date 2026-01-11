"use client";

import { useActionState, useState } from "react";
import { createItemAction } from "@/services/item-actions";
import { getGCPUploadSignedUrl } from "@/services/upload-actions";

export default function TestCreateItemForm() {
    const [state, action, isPending] = useActionState(
        createItemAction,
        undefined
    );

    // Local state to handle the 2-step upload process
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    // 1. The "Upload First" Handler
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        const newUrls: string[] = [];

        try {
            // Loop through all selected files
            for (const file of Array.from(files)) {
                // A. Ask Server for Signed URL
                const { signedUrl, fileUrl, message } =
                    await getGCPUploadSignedUrl(file.type, file.size);

                console.log("Got signed URL:", signedUrl, fileUrl, message);

                if (!signedUrl) {
                    alert(`Failed to get signed URL for ${file.name}`);
                    continue;
                }

                // B. Upload directly to Google Cloud Storage
                const response = await fetch(signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type,
                    },
                });

                if (!response.ok) throw new Error("Upload failed");

                // C. If success, keep the public URL
                newUrls.push(fileUrl);
            }

            setUploadedUrls((prev) => [...prev, ...newUrls]);
        } catch (err) {
            console.error(err);
            alert("Error uploading images");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "500px",
                margin: "50px auto",
                padding: "20px",
                border: "1px solid #ccc",
            }}
        >
            <h2>Ugly Test Form (Create Item)</h2>

            {/* Show Global Errors/Success */}
            {state?.message && (
                <p style={{ color: state.success ? "green" : "red" }}>
                    {state.message}
                </p>
            )}

            <form
                action={action}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {/* Title */}
                <div>
                    <label>Title</label>
                    <input
                        name="title"
                        type="text"
                        placeholder="Vintage Camera"
                        required
                        style={{ width: "100%" }}
                    />
                    {state?.errors?.title && (
                        <p style={{ color: "red" }}>{state.errors.title}</p>
                    )}
                </div>

                {/* Price */}
                <div>
                    <label>Price</label>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        required
                        style={{ width: "100%" }}
                    />
                    {state?.errors?.price && (
                        <p style={{ color: "red" }}>{state.errors.price}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        placeholder="Item details..."
                        required
                        style={{ width: "100%" }}
                    />
                    {state?.errors?.description && (
                        <p style={{ color: "red" }}>
                            {state.errors.description}
                        </p>
                    )}
                </div>

                {/* Condition */}
                <div>
                    <label>Condition</label>
                    <select
                        name="condition"
                        defaultValue="good"
                        style={{ width: "100%" }}
                    >
                        <option value="new">New</option>
                        <option value="like-new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                    {state?.errors?.condition && (
                        <p style={{ color: "red" }}>{state.errors.condition}</p>
                    )}
                </div>

                {/* --- IMAGE UPLOAD SECTION --- */}
                <div style={{ border: "1px dashed #666", padding: "10px" }}>
                    <label>Photos (Uploads immediately)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />

                    {uploading && <p>Uploading to GCS...</p>}

                    {/* Visual confirmation of uploads */}
                    <div
                        style={{
                            display: "flex",
                            gap: "5px",
                            marginTop: "10px",
                        }}
                    >
                        {uploadedUrls.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt="upload"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                }}
                            />
                        ))}
                    </div>

                    {/* CRITICAL: Hidden inputs to send URLs to Server Action */}
                    {/* The formData.getAll('images') will pick these up! */}
                    {uploadedUrls.map((url) => (
                        <input
                            key={url}
                            type="hidden"
                            name="images"
                            value={url}
                        />
                    ))}

                    {state?.errors?.images && (
                        <p style={{ color: "red" }}>{state.errors.images}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending || uploading}
                    style={{ padding: "10px", marginTop: "20px" }}
                >
                    {isPending ? "Creating Item..." : "Submit Item"}
                </button>
            </form>
        </div>
    );
}
