import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './CopyAction.module.css';


const CopyAction = ({text, label, children}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.copyContainer} onClick={handleCopy} title={`Скопіювати ${label}`}>
      {/* Сюди потрапить твій <p> */}
      {children}

      <button className={styles.copyButton}>
        {copied ? (
          <Check size={14} className="text-green-500"/>
        ) : (
          <Copy size={14} className="text-gray-400 group-hover:text-blue-500"/>
        )}
      </button>
    </div>
  );
};


export default CopyAction;



