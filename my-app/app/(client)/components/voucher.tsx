"use client";
import { useState, useEffect } from 'react';
import { VoucherDisplayProps } from './cautrucdata';
import "../style/voucher.css";

interface AnimatedVoucherProps extends VoucherDisplayProps {
  index?: number;
}

export default function VoucherDisplay({
  code,
  discountValue,
  description,
  index = 0
}: AnimatedVoucherProps) {
  const [copied, setCopied] = useState(false);
  const [randomLeft, setRandomLeft] = useState(0);
  const [delay, setDelay] = useState(0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    });
  };

  useEffect(() => {
    // Giữ khoảng cách đều nhau + chút ngẫu nhiên
    const baseLeft = index * 15 + Math.random() * 10;
    setRandomLeft(Math.min(baseLeft, 90));
    setDelay(Math.random() * 4);
  }, [index]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${randomLeft}%`,
        bottom: '-150px',
        animation: `flyUp 8s linear infinite`,
        animationDelay: `${delay}s`,
        zIndex: 1000,
        border: '2px dashed #0073aa',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        width: '250px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: '#0073aa', marginBottom: '10px' }}>🎁 MÃ GIẢM GIÁ</h3>
      <p><strong>{description || "Ưu đãi đang chờ bạn!"}</strong></p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
      }}>
        <code style={{
          fontSize: '16px',
          background: '#eaeaea',
          padding: '5px 10px',
          borderRadius: '5px'
        }}>{code}</code>
        <button
          onClick={copyToClipboard}
          style={{
            backgroundColor: copied ? '#2ecc71' : '#0073aa',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>

      {discountValue && (
        <p style={{ marginTop: '10px', color: '#e74c3c' }}>
          🔻 Giảm: {discountValue}
        </p>
      )}
    </div>
  );
}
