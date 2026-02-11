import { useState, useContext } from 'react';
import { AuthContext } from "../../context/AuthContext";
import { authInstance } from "../../api/reqService";
import * as S from './MemberModal.style';

// 사장님 등록하기 모달
export const RegisterOwnerModal = ({ isOpen, onClose }) => {
  const { auth } = useContext(AuthContext);
  const [businessNumber, setBusinessNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!auth?.accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 사업자 번호 유효성 검사 (10자리 숫자)
    if (!/^\d{10}$/.test(businessNumber)) {
      alert('사업자 번호는 10자리 숫자로 입력해주세요.');
      return;
    }

    const requestData = {
      businessNo: businessNumber,
      restaurantName: storeName,
      address: address,
      status: 'Y'
    };

    authInstance.post('/api/members/owner', requestData)
      .then((res) => {
        alert('사장님 등록 신청이 완료되었습니다! 관리자 승인 후 이용 가능합니다.');
        onClose();
        // 입력 필드 초기화
        setBusinessNumber('');
        setStoreName('');
        setAddress('');
      })
      .catch((err) => {
        const errorMessage = err?.response?.data?.message 
          || err?.response?.data?.['error-message']
          || '사장님 등록에 실패했습니다.';
        alert(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.Modal onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>사장님 등록하기</S.ModalTitle>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.FormLabel>사업자 번호</S.FormLabel>
            <S.FormInput
              type="text"
              name="businessNumber"
              placeholder="사업자 번호를 입력해주세요. (- 제외)"
              value={businessNumber}
              onChange={(e) => {
                // 숫자만 입력 가능
                const value = e.target.value.replace(/[^0-9]/g, '');
                setBusinessNumber(value);
              }}
              maxLength="10"
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.FormLabel>가게 이름</S.FormLabel>
            <S.FormInput
              type="text"
              name="storeName"
              placeholder="상호를 입력해주세요."
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.FormLabel>사업장 소재지</S.FormLabel>
            <S.FormInput
              type="text"
              name="address"
              placeholder="주소를 입력해주세요."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <S.HelpText>관리자 승인 후 등록됩니다.</S.HelpText>
          </S.FormGroup>
          <S.SubmitButton type="submit">등록</S.SubmitButton>
        </form>
      </S.Modal>
    </S.ModalOverlay>
  );
};