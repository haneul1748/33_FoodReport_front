import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './MyInfo.style';
import { RegisterOwnerModal } from '../common/Modal/OwnerModal';
import { ResetPasswordModal } from '../common/Modal/PasswordModal';
import { authInstance } from "../api/reqService";
import { AuthContext } from '../context/AuthContext';

const MyInfo = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        phone: '',
        introduce: '',
        profileImage: null,
        currentImageUrl: null,
        role: ''

    });
    const [bioLength, setBioLength] = useState(0);
    const [saveChecked, setSaveChecked] = useState(false);
    const [errors, setErrors] = useState({
        phone: ''
    });

    // Modal 상태 관리
    const [modals, setModals] = useState({
        register: false,
        password: false
    });

    // 회원 정보 조회 함수 분리
    const fetchMemberInfo = () => {
        authInstance.get('/api/members/info')
            .then((res) => {
                const data = res.data.data || res.data;

                // 이미지 URL 생성 - S3 URL 그대로 사용
                let imageUrl = null;
                if (data.memberImages) {
                    if (data.memberImages.changeName) {
                        imageUrl = data.memberImages.changeName; // S3 전체 URL 그대로 사용
                    }
                    else if (Array.isArray(data.memberImages) && data.memberImages.length > 0 && data.memberImages[0].changeName) {
                        imageUrl = data.memberImages[0].changeName; // S3 전체 URL 그대로 사용
                    }
                }

                setFormData({
                    email: data.email || '',
                    nickname: data.nickname || '',
                    phone: data.phone || '',
                    introduce: data.introduce || '',
                    profileImage: null,
                    currentImageUrl: imageUrl,
                    role: data.role || auth.role || ''
                });
                setBioLength(data.introduce ? data.introduce.length : 0);
            })
            .catch((err) => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                } else {
                    alert('회원 정보를 불러오는데 실패했습니다.');
                }
            });
    };

    // 회원 정보 조회
    useEffect(() => {
        if (!auth?.accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // localStorage에 토큰 저장 (authInstance가 사용)
        localStorage.setItem('accessToken', auth.accessToken);

        fetchMemberInfo();
    }, [auth?.accessToken, navigate]);

    const openModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    const validatePhone = (phone) => {
        if (!phone) return true;
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        return phoneRegex.test(phone);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'introduce') {
            setBioLength(value.length);
        }

        if (name === 'phone') {
            if (value && !validatePhone(value)) {
                setErrors(prev => ({ ...prev, phone: '전화번호 형식이 맞지 않습니다. (예: 010-1234-5678)' }));
            } else {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
                alert('PNG 또는 JPG 형식의 이미지만 업로드 가능합니다.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setFormData(prev => ({
                ...prev,
                profileImage: file
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!saveChecked) {
            alert('사용자 정보를 저장하려면 체크해주세요!');
            return;
        }

        if (!formData.nickname || formData.nickname.trim() === '') {
            alert('닉네임은 필수 입력 항목입니다.');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            alert('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
            return;
        }

        if (!auth?.accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // localStorage에 토큰 저장
        localStorage.setItem('accessToken', auth.accessToken);

        const submitData = new FormData();
        submitData.append('nickname', formData.nickname.trim());
        submitData.append('phone', formData.phone || '');
        submitData.append('introduce', formData.introduce || '');

        if (formData.profileImage) {
            submitData.append('file', formData.profileImage);
        }

        authInstance.put('/api/members/info', submitData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((res) => {
                alert('회원 정보가 수정되었습니다.');
                setSaveChecked(false);
                fetchMemberInfo(); // window.location.reload() 대신 데이터 재조회
            })
            .catch((err) => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                } else {
                    const errorMessage = err?.response?.data?.message
                        || err?.response?.data?.['error-message']
                        || '회원 정보 수정에 실패했습니다.';
                    alert(errorMessage);
                }
            });
    };

    const handleCancel = () => {
        navigate('/');
    };

    const handleOwnerRegister = () => {
        openModal('register');
    };

    const handlePasswordReset = () => {
        openModal('password');
    };

    const getProfileImageUrl = () => {
        if (formData.profileImage) {
            return URL.createObjectURL(formData.profileImage);
        }
        if (formData.currentImageUrl) {
            return formData.currentImageUrl;
        }
        return '/user.png';
    };

    return (
        <S.MyInfoContainer>
            <S.Breadcrumb>
                홈 & 마이페이지 & 내 정보
            </S.Breadcrumb>
            {(auth.role === '[ROLE_OWNER]' || auth.role === '[ROLE_ADMIN]') && (
                <S.OwnerBadge>사장님 인증</S.OwnerBadge>
            )}  
            <S.Title>내 정보</S.Title>
            <S.Form onSubmit={handleSubmit}>
                <S.ProfileSection>
                    <S.ProfileImageWrapper>
                        <S.ProfileImage
                            src={getProfileImageUrl()}
                            alt="프로필"
                            onError={(e) => {
                                e.target.src = '/user.png';
                            }}
                        />
                    </S.ProfileImageWrapper>
                    <S.ProfileText>
                        프로필 사진은 귀하의 프로필과 목록에 표시됩니다. PNG 또는 JPG 형식으로 가로 세로 500픽셀 이하로 업로드하세요.
                    </S.ProfileText>
                    <S.FileInputWrapper>
                        <S.FileInput
                            type="file"
                            id="profileImage"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleFileChange}
                        />
                        <S.FileLabel htmlFor="profileImage">
                            🔄 사진 업데이트
                        </S.FileLabel>
                    </S.FileInputWrapper>
                </S.ProfileSection>

                <S.InputGroup>
                    <S.Label>이메일</S.Label>
                    <S.Input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                    />
                </S.InputGroup>

                <S.InputGroup>
                    <S.Label>닉네임 *</S.Label>
                    <S.Input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                        placeholder="닉네임을 입력하세요"
                    />
                </S.InputGroup>

                <S.InputGroup>
                    <S.Label>전화번호</S.Label>
                    <S.Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                    />
                    {errors.phone && <S.ErrorText>{errors.phone}</S.ErrorText>}
                </S.InputGroup>

                <S.InputGroup>
                    <S.Label>소개글</S.Label>
                    <S.TextAreaWrapper>
                        <S.TextArea
                            name="introduce"
                            value={formData.introduce}
                            onChange={handleChange}
                            maxLength={100}
                            rows={4}
                            placeholder="자신을 소개해주세요"
                        />
                        <S.CharCount>{bioLength}/100자</S.CharCount>
                    </S.TextAreaWrapper>
                </S.InputGroup>

                <S.CheckboxWrapper>
                    <S.Checkbox
                        type="checkbox"
                        checked={saveChecked}
                        onChange={(e) => setSaveChecked(e.target.checked)}
                    />
                    <S.CheckboxLabel>사용자 정보를 저장하려면 체크해주세요!</S.CheckboxLabel>
                </S.CheckboxWrapper>

                <S.ButtonGroup>
                    <S.ConfirmButton type="submit">확인</S.ConfirmButton>
                    <S.CancelButton type="button" onClick={handleCancel}>취소</S.CancelButton>
                </S.ButtonGroup>
            </S.Form>

            <S.Section>
                <S.SectionTitle>사장님 등록하기</S.SectionTitle>
                <S.SectionDescription>사업장을 등록합니다.</S.SectionDescription>
                <S.SectionButton onClick={handleOwnerRegister}>등록</S.SectionButton>
            </S.Section>

            <S.Section>
                <S.SectionTitle>비밀번호 재설정</S.SectionTitle>
                <S.SectionDescription>비밀번호를 변경합니다.</S.SectionDescription>
                <S.SectionButton onClick={handlePasswordReset}>변경</S.SectionButton>
            </S.Section>

            <RegisterOwnerModal
                isOpen={modals.register}
                onClose={() => closeModal('register')}
            />
            <ResetPasswordModal
                isOpen={modals.password}
                onClose={() => closeModal('password')}
            />
        </S.MyInfoContainer>
    );
};

export default MyInfo;