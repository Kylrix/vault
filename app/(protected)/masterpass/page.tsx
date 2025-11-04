"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppwrite } from "@/app/appwrite-provider";
import { MasterPassModal } from "@/components/overlays/MasterPassModal";
import { openAuthPopup } from "@/lib/authUrl";

export default function MasterPassPage() {
  const [showModal, setShowModal] = useState(false);
  const { user, isAuthReady } = useAppwrite();
  const router = useRouter();

  // Once auth is ready, determine what to show
  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      // User is logged in, show masterpass unlock modal
      setShowModal(true);
    } else {
      // No user session, open auth popup
      try {
        openAuthPopup();
      } catch (err) {
        console.error("Failed to open auth popup:", err);
      }
    }
  }, [user, isAuthReady]);

  const handleModalClose = () => {
    // After unlocking masterpass, go to dashboard
    router.replace("/dashboard");
  };

  return <MasterPassModal isOpen={showModal} onClose={handleModalClose} />;
}
