import React, { useState, useEffect } from "react";
import "./Profile.css";
import { message } from "antd";
import {
  protectedInfo,
  updateProfile,
  logout,
  deleteAccount,
  refreshAccessToken,
} from "../auth/api";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const MyPage = () => {
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newNick, setNewNick] = useState("");
  const [newPw, setNewPw] = useState("");
  const [currentPw, setCurrentPw] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await protectedInfo();
        setNickname(me.nickname);
        setUserId(me.id);
      } catch (e) {
        // not logged in
      }
    })();
  }, []);

  const ProfileCard = ({
    title,
    subtitle,
    icon,
    onClick,
  }: {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    onClick: () => void;
  }) => (
    <button onClick={onClick} className="profile-card-item">
      <div className="card-content">
        <div className="card-icon">{icon}</div>
        <div className="card-text">
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      </div>
      <svg
        className="card-arrow"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );

  const onSaveNickname = async () => {
    try {
      const res = await updateProfile({
        nickname: newNick || undefined,
      });
      const nn = res?.nickname || res?.nick || newNick;
      if (nn) setNickname(nn);
      message.success("닉네임이 변경되었습니다.");
      setShowNicknameModal(false);
      setNewNick("");
    } catch (e) {
      message.error("저장 중 오류가 발생했습니다.");
    }
  };

  const onChangePassword = async () => {
    try {
      await updateProfile({
        password: newPw || undefined,
        currentPassword: currentPw || undefined,
      });
      message.success("비밀번호가 변경되었습니다.");
      setShowPasswordModal(false);
      setNewPw("");
      setCurrentPw("");
    } catch (e) {
      message.error("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/";
    }
  };

  const onDelete = async () => {
    try {
      await deleteAccount();
      message.success("탈퇴가 완료되었습니다.");
      window.location.href = "/";
    } catch (e) {
      message.error("탈퇴 중 오류가 발생했습니다.");
    }
  };

  const onRefresh = async () => {
    try {
      await refreshAccessToken();
      message.success("액세스 토큰을 재발급했습니다.");
    } catch {
      message.error("재발급 실패");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-grid">
          {/* Right Content */}
          <div className="profile-right-content">
            <div className="profile-header">
              <h2>로그인 및 보안</h2>
              <p>
                계정 로그인, 계정 보안 및 로그인하는 데 문제가 있을 경우
                데이터를 복구하는 방법과 권한된 설정을 관리합니다.
              </p>
            </div>

            <div className="profile-cards-list">
              {/* <ProfileCard
                title="Apple ID"
                subtitle={`@${userId}`}
                icon={
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                }
                onClick={() => message.info("Apple ID 수정")}
              /> */}

              <ProfileCard
                title="비밀번호"
                subtitle="비밀번호를 변경합니다"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                }
                onClick={() => setShowPasswordModal(true)}
              />

              <ProfileCard
                title="닉네임 변경"
                subtitle={nickname}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                onClick={() => setShowNicknameModal(true)}
              />

              {/* <ProfileCard
                title="액세스 토큰 재발급"
                subtitle="토큰을 새로 발급받습니다"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
                onClick={onRefresh}
              /> */}

              <ProfileCard
                title="로그아웃"
                subtitle="현재 세션에서 로그아웃합니다"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                }
                onClick={onLogout}
              />

              <ProfileCard
                title="회원 탈퇴"
                subtitle="계정을 영구적으로 삭제합니다"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                }
                onClick={() => setShowDeleteModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nickname Modal */}
      <Modal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        title="닉네임 변경"
      >
        <input
          type="text"
          placeholder="새 닉네임"
          value={newNick}
          onChange={(e) => setNewNick(e.target.value)}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button
            onClick={onSaveNickname}
            className="modal-button modal-button-primary"
          >
            저장
          </button>
          <button
            onClick={() => {
              setShowNicknameModal(false);
              setNewNick("");
            }}
            className="modal-button modal-button-secondary"
          >
            취소
          </button>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="비밀번호 변경"
      >
        <input
          type="password"
          placeholder="현재 비밀번호"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className="modal-input"
        />
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="modal-input"
          style={{ marginTop: "12px" }}
        />
        <div className="modal-buttons">
          <button
            onClick={onChangePassword}
            className="modal-button modal-button-primary"
          >
            변경
          </button>
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setCurrentPw("");
              setNewPw("");
            }}
            className="modal-button modal-button-secondary"
          >
            취소
          </button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="회원 탈퇴"
      >
        <p className="modal-text">
          정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="modal-buttons">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              onDelete();
            }}
            className="modal-button modal-button-danger"
          >
            탈퇴
          </button>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="modal-button modal-button-secondary"
          >
            취소
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyPage;
