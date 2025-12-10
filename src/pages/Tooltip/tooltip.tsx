/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from "react";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

interface TooltipProps {
  content?: React.ReactNode;
  trigger?: ("hover" | "click" | "focus")[];
  children?: React.ReactNode;
  place?: string
}

const CustomTooltip: React.FC<TooltipProps> = ({
  content,
  trigger = ["hover"],
  children,
  place
}) => {
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right">("top");

  const updatePlacement = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const { top, bottom, left, right } = rect;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const tooltipHeight = 50;
      const tooltipWidth = 100;

      let newPlacement: "top" | "bottom" | "left" | "right" = "bottom";

      if (top < tooltipHeight && bottom + tooltipHeight <= windowHeight) {
        newPlacement = "bottom";
      } else if (bottom + tooltipHeight > windowHeight && top >= tooltipHeight) {
        newPlacement = "top";
      }
      else if (left < tooltipWidth && right + tooltipWidth <= windowWidth) {
        newPlacement = "right";
      } else if (right + tooltipWidth > windowWidth && left >= tooltipWidth) {
        newPlacement = "left";
      }

      setPlacement(newPlacement);
    }
  };

  useEffect(() => {
    updatePlacement();

    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement);
    };
  }, [content, children]);

  return (
    <Tooltip placement={place?place:placement}
      trigger={trigger}
      overlay={content}
      overlayInnerStyle={{
        maxWidth: '300px',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      <span ref={tooltipRef} style={{ display: 'inline-block' }}>
        {children}
      </span>
    </Tooltip>
  );
};

export default CustomTooltip;