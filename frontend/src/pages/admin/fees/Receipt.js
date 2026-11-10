import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../Components/Loader";
import { ViewOneFees, GetReceiptByNo } from "../../../Service/admin/Fees";
import ReceiptModal from "./ReceiptModal";

/**
 * Standalone Receipt View Page / Component
 */
export default function Receipt() {
  const { id, receiptNo, paymentIndex } = useParams();
  const navigate = useNavigate();
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        setLoading(true);
        if (receiptNo) {
          const res = await GetReceiptByNo(receiptNo);
          const feeData = res?.data?.data || res?.data || res;
          if (feeData) {
            setFees(feeData);
          }
        } else if (id) {
          const res = await ViewOneFees(id);
          const feeData = res?.data?.data || res?.data || res;
          if (feeData) {
            setFees(feeData);
          }
        }
      } catch (err) {
        console.error("Failed to load receipt:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [id, receiptNo]);

  if (loading) {
    return <Loader />;
  }

  return (
    <ReceiptModal
      open={true}
      onClose={() => navigate(-1)}
      fees={fees}
      paymentIndex={paymentIndex ? parseInt(paymentIndex, 10) : 0}
    />
  );
}
