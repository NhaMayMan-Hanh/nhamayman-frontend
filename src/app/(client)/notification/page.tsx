import ProfileSidebar from "@components/client/profile/ProfileSidebar";

export default function Notification() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <ProfileSidebar activePath="/profile" />

          <div className="lg:col-span-3 p-4">Tính năng đang phát triển</div>
        </div>
      </div>
    </div>
  );
}
