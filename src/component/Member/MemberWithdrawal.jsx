import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './MemberWithdrawal.style';
import { AuthContext } from '../context/AuthContext';
import { publicInstance } from '../api/reqService.js';

const MemberWithdrawal = () => {
    const navigate = useNavigate();
    const { auth, logout } = useContext(AuthContext);
    const [confirmText, setConfirmText] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConfirmed) {
            alert('회원 탈퇴를 확인해주세요.(Check Box)');
            return;
        }

        if (confirmText !== '탈퇴') {
            alert('"탈퇴"를 정확히 입력해주세요.');
            return;
        }

        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        publicInstance.delete('/api/members', {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                password: password
            }
        })
        .then((res) => {
            if (res.status === 200) {
                alert('회원 탈퇴가 완료되었습니다.');
                logout();
                navigate('/');
            }
        })
        .catch((err) => {
            const errorMessage = err?.response?.data?.message
                || err?.response?.data?.['error-message']
                || '회원 탈퇴 중 문제가 발생했습니다.';
            alert(errorMessage);
        });
    };

    return (
        <S.MemberWithdrawalContainer>
            <S.Breadcrumb>
                홈 & 마이페이지 & 회원 탈퇴
            </S.Breadcrumb>

            <S.Title>회원 탈퇴</S.Title>

            <S.WarningBox>
                <S.WarningTitle>⚠️ 주의사항</S.WarningTitle>
                <S.WarningList>
                    <li>탈퇴 후 동일한 이메일로 재가입이 불가능합니다.</li>
                </S.WarningList>
            </S.WarningBox>

            <S.Form onSubmit={handleSubmit}>
                <S.InputGroup>
                    <S.Label>탈퇴 확인</S.Label>
                    <S.ConfirmInput
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="탈퇴를 확인하려면 '탈퇴'를 입력하세요"
                    />
                    <S.ConfirmText>
                        회원 탈퇴를 확인하려면 위 입력란에 "탈퇴"를 입력해주세요.
                    </S.ConfirmText>
                </S.InputGroup>

                <S.InputGroup>
                    <S.Label>비밀번호 확인</S.Label>
                    <S.InputWrapper>
                        <S.PasswordInput
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="현재 비밀번호를 입력해주세요."
                            required
                        />
                        <S.TogglePasswordButton
                            type="button"
                            onClick={togglePassword}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </S.TogglePasswordButton>
                    </S.InputWrapper>
                </S.InputGroup>

                <S.CheckboxWrapper>
                    <S.Checkbox
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                    />
                    <S.CheckboxLabel>
                        위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다.
                    </S.CheckboxLabel>
                </S.CheckboxWrapper>

                <S.ButtonGroup>
                    <S.WithdrawButton type="submit">탈퇴하기</S.WithdrawButton>
                    <S.CancelButton type="button" onClick={() => navigate('/mypage/info')}>
                        취소
                    </S.CancelButton>
                </S.ButtonGroup>
            </S.Form>
        </S.MemberWithdrawalContainer>
    );
};

export default MemberWithdrawal;