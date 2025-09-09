"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Lock, Save, User as UserIcon, BookOpen, Smile } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import Footer from "@/Components/footer";
import NavbarClient from "@/Components/NavbarClient";
// User Profile type
type UserProfile = {
  id: number;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  bio: string | null;
  hobbies: string | null;
};

// Profile Image component
const ProfileImage = ({
  imageUrl,
  initials,
}: // isUploading,
// onClick,
{
  imageUrl: string | null;
  initials: string;
  // isUploading: boolean;
  // onClick: () => void;
}) => {
  return (
    <div className="relative">
      <div
        className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-white bg-cover bg-center"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          backgroundColor: !imageUrl ? "#3B82F6" : "transparent",
        }}
      >
        {!imageUrl && initials}
      </div>
      {/* <button
        onClick={onClick}
        disabled={isUploading}
        className="absolute bottom-1 right-1 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </button> */}
    </div>
  );
};

// Main Profile Page
export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { notify } = useNotification();

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [hobbies, setHobbies] = useState("");

  // Password Modal State
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        setUser(userData);
        setName(userData.name || "");
        setBio(userData.bio || "");
        setHobbies(userData.hobbies || "");
      } catch (error) {
        console.error(error);
        notify("error", "Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [notify]);

  const getInitials = (name: string | null = ""): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setUser((prev) =>
          prev ? { ...prev, imageUrl: result.imageUrl } : null
        );
        notify("success", "Profile image updated successfully!");
      } else {
        notify("error", "Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      notify("error", "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, hobbies }),
      });
      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        notify("success", "Profile updated successfully!");
        router.push("/dashboard"); // notification still visible after redirect
      } else {
        notify("error", "Update failed: " + result.error);
      }
    } catch (error) {
      console.error("Update error:", error);
      notify("error", "An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();

      if (result.success) {
        setPasswordSuccess("Password changed successfully!");
        notify("success", "Password changed successfully!");
        setTimeout(() => setPasswordModalOpen(false), 2000);
      } else {
        setPasswordError(result.error || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const newText =
      (bio || "")?.slice(0, cursorPos) +
      emojiData.emoji +
      (bio || "").slice(cursorPos);

    if (newText.length <= 250) {
      setBio(newText);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          cursorPos + emojiData.emoji.length,
          cursorPos + emojiData.emoji.length
        );
      }, 0);
    }
  };
  useEffect(() => {
    if (user) setBio(user.bio || "");
  }, [user]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-20">
        Could not load user profile. Please try logging in again.
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="bg-gray-50 min-h-screen">
        <NavbarClient user={user} />
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            Edit Profile
          </h1>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleProfileUpdate}>
              {/* Profile Image and Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                <ProfileImage
                  imageUrl={user.imageUrl}
                  initials={getInitials(user.name)}
                  // isUploading={isUploading}
                  // onClick={() => fileInputRef.current?.click()}
                />
                <div className="flex-grow w-full">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-8 grid grid-cols-1 gap-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      placeholder="Your Name"
                      onChange={(e) => setName(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        !user?.name || name !== user.name
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </label>
                    <div className="relative">
                      <BookOpen className="pointer-events-none w-5 h-5 absolute top-2 left-3 text-gray-400" />

                      {/* Emoji-enabled textarea */}
                      <textarea
                        id="bio"
                        ref={textareaRef}
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 140))} // max 140 chars
                        onFocus={(e) => e.target.select()}
                        placeholder="Tell us a little about yourself"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-400 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none h-16 text-gray-700"
                      />

                      {/* Emoji picker button */}
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                      >
                        😊
                      </button>

                      {/* Emoji picker dropdown */}
                      {showEmojiPicker && (
                        <div className="absolute z-50 mt-2">
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={Theme.LIGHT}
                          />
                        </div>
                      )}
                    </div>

                    {/* Character counter */}
                    <p className="text-sm text-gray-500 mt-1">
                      {140 - (bio?.length || 0)} characters remaining
                    </p>
                  </div>
                </div>

                {/* Hobbies */}
                <div>
                  <label
                    htmlFor="hobbies"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hobbies
                  </label>
                  <div className="relative">
                    <Smile className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                    <input
                      type="text"
                      id="hobbies"
                      value={hobbies || user?.hobbies || ""}
                      onChange={(e) => setHobbies(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g., Reading, Hiking, Coding"
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        hobbies && hobbies !== user?.hobbies
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
        <Footer></Footer>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleChangePassword}>
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                Change Your Password
              </h3>
              <div className="mt-4 space-y-4">
                {passwordError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>



      )}

    </>
    
  );

  
}

