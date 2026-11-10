import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MarksheetModal from "./MarksheetModal";

/**
 * Standalone Marksheet View / Print Page
 */
export default function Marksheet() {
  const { studentId, id } = useParams();
  const navigate = useNavigate();

  return (
    <MarksheetModal
      open={true}
      onClose={() => navigate(-1)}
      studentId={studentId || id}
    />
  );
}
