import React from 'react'

const AttributeBtn = ({
    active,
    available,
    onClick,
    children,
  }: {
    active: boolean;
    available: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => {
      return (
      <button
        disabled={!available}
        onClick={onClick}
        className={`
          flex items-center justify-center
          min-w-[32px] min-h-[32px]
          rounded-full border
          transition-all
          ${!available
            ? "opacity-40 cursor-not-allowed border-gray-200"
            : active
            ? "border-shop_medium_primary ring-2 ring-shop_medium_primary/40"
            : "border-gray-300 hover:border-shop_medium_primary"
          }
        `}
      >
        {children}
      </button>
    );
}

export default AttributeBtn


