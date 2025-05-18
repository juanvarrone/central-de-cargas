
import { useEffect } from "react";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminDebugInfo from "@/components/admin/AdminDebugInfo";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const AdminPage = () => {
  const { loading, isAdmin, debugInfo } = useAdminAccess();

  // Show loading state while checking session and admin status
  if (loading) {
    return <AdminLoading />;
  }

  // Debug mode - show what went wrong with admin check
  if (!isAdmin && debugInfo) {
    return <AdminDebugInfo debugInfo={debugInfo} />;
  }
  
  // Extra safety check - shouldn't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  return <AdminPageLayout />;
};

export default AdminPage;
