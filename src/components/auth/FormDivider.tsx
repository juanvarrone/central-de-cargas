
import React from "react";

const FormDivider = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-neutral-50 px-2 text-muted-foreground">
          O continúa con email
        </span>
      </div>
    </div>
  );
};

export default FormDivider;
