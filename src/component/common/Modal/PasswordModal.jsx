import { useState, useContext } from 'react';
import { authInstance } from "../../api/reqService";
import { AuthContext } from "../../context/AuthContext";
import * as S from './MemberModal.style';

// 비밀번호 재설정 모달
export const ResetPasswordModal = ({ isOpen, onClose }) => {
  const { auth } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const togglePassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사 (백엔드와 동일한 패턴)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!passwordRegex.test(newPassword)) {
      alert('비밀번호는 8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    authInstance.put('/api/members', {
      currentPassword,
      newPassword,
      confirmPassword
    })
      .then((result) => {
        if (result.status === 200) {
          alert("비밀번호 변경에 성공했습니다.");
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setError('');
        }
      })
      .catch((err) => {
        console.error('비밀번호 변경 실패:', err);
        const errorMessage = err?.response?.data?.message 
          || err?.response?.data?.['error-message'] 
          || "비밀번호 변경 중 문제가 발생했습니다.";
        setError(errorMessage);
        alert(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.Modal onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>비밀번호 재설정</S.ModalTitle>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.FormLabel>현재 비밀번호</S.FormLabel>
            <S.InputWrapper>
              <S.FormInput
                type={showPassword.currentPassword ? 'text' : 'password'}
                name="currentPassword"
                placeholder="현재 비밀번호를 입력해주세요."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                $hasToggle
                required
              />
              <S.TogglePasswordButton
                type="button"
                onClick={() => togglePassword('currentPassword')}
              >
                {showPassword.currentPassword ? '👁️' : '👁️‍🗨️'}
              </S.TogglePasswordButton>
            </S.InputWrapper>
          </S.FormGroup>
          <S.FormGroup>
            <S.FormLabel>변경 비밀번호</S.FormLabel>
            <S.InputWrapper>
              <S.FormInput
                type={showPassword.newPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="변경할 비밀번호를 입력해주세요."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                $hasToggle
                required
              />
              <S.TogglePasswordButton
                type="button"
                onClick={() => togglePassword('newPassword')}
              >
                {showPassword.newPassword ? '👁️' : '👁️‍🗨️'}
              </S.TogglePasswordButton>
            </S.InputWrapper>
            <S.HelpText>8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.</S.HelpText>
          </S.FormGroup>
          <S.FormGroup>
            <S.FormLabel>변경 비밀번호 확인</S.FormLabel>
            <S.InputWrapper>
              <S.FormInput
                type={showPassword.confirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="변경할 비밀번호를 재입력해주세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                $hasToggle
                required
              />
              <S.TogglePasswordButton
                type="button"
                onClick={() => togglePassword('confirmPassword')}
              >
                {showPassword.confirmPassword ? '👁️' : '👁️‍🗨️'}
              </S.TogglePasswordButton>
            </S.InputWrapper>
          </S.FormGroup>
          <S.SubmitButton type="submit">변경하기</S.SubmitButton>
        </form>
      </S.Modal>
    </S.ModalOverlay>
  );
};