import React, { useState, ChangeEvent, useRef } from 'react';
import { IUser } from '../../components/cautrucdata';
import "../../style/img111.css";
type Props = {
    user: IUser;
    onAvatarChange?: (newAvatar: string) => void; // callback để cập nhật user bên ngoài
};


const AvatarUpload: React.FC<Props> = ({ user, onAvatarChange }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setSelectedFile(file || null);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn file!");
            return;
        }

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        try {
            const res = await fetch(`http://localhost:3000/api/change-avatar/${user.user_id}`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload thất bại');
            const data = await res.json();

            alert("Cập nhật avatar thành công!");

            // ✅ cập nhật preview để thấy ảnh mới
            setPreview(`http://localhost:3000/avatar/${data.avatar}?t=${Date.now()}`); // thêm ?t= để tránh cache

            // ✅ gọi callback nếu có
            if (onAvatarChange) onAvatarChange(data.avatar);

        } catch (error) {
            console.error("Lỗi khi upload:", error);
            alert("Lỗi khi đổi avatar");
        }
    };
    const handleIconClick = () => {
        fileInputRef.current?.click(); // Mở file input khi click icon
    };
    return (
        <div>
            <div className="avatar-upload">
                <img
                    src={preview || `http://localhost:3000/avatar/${user.avatar}?t=${Date.now()}`}
                    alt="avatar"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // tránh lặp nếu fallback cũng lỗi
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&font-size=.5`;
                    }}
                    style={{
                        borderRadius: '50%',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />

                <i
                    className="fa-solid fa-pen edit-icon"
                    onClick={handleIconClick}
                ></i>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Chỉ hiện khi đã chọn ảnh */}
            {selectedFile && (
                <button
                    style={{
                        marginTop: '10px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onClick={handleUpload}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#0056b3')
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = '#007bff')
                    }
                >
                    Cập nhật ảnh
                </button>
            )}
        </div>
    );






};


export default AvatarUpload;
