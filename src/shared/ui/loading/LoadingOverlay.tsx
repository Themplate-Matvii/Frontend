"use client";

import React from "react";
import Spinner from "./Spinner";

type Props = {
  loading?: boolean;
  isGlobal?: boolean; // show loader full-screen
};

export const LoadingOverlay = ({ loading = false, isGlobal = false }: Props) => {
  if (!loading) return null;

  const positionClass = isGlobal
    ? "fixed inset-0"          // covers whole viewport
    : "absolute inset-0 rounded-xl"; // covers local container

  return (
    <div className={`${positionClass} z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center`}>
      <Spinner size={28} />
    </div>
  );
};
