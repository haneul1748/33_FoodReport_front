import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Paging/Pagination';
import * as S from './ReviewManagement.style';
import { authInstance } from '../api/reqService';
import { AuthContext } from '../context/AuthContext';

const ReviewManagement = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        startPage: 1,
        endPage: 1,
        maxPage: 1
    });

    // 회원 리뷰 전체 조회
    const fetchReviews = (page = 1) => {
        if (!auth?.accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        authInstance.get(`/api/members/reviews?page=${page}`)
            .then((res) => {
                const data = res.data.data || res.data;
                setReviews(data.memberReviews || []);

                if (data.pages) {
                    setPageInfo({
                        currentPage: data.pages.currentPage,
                        startPage: data.pages.startPage,
                        endPage: data.pages.endPage,
                        maxPage: data.pages.maxPage
                    });
                }
            })
            .catch((err) => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('리뷰를 불러오는데 실패했습니다.');
                }
            });
    };

    // 컴포넌트 마운트 시 리뷰 조회
    useEffect(() => {
        fetchReviews(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 검색 필터링
    const filteredReviews = reviews.filter(review =>
        review.reviewTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewContent?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <S.ReviewManagementContainer>
            <S.Breadcrumb>
                홈 & 마이페이지 & 리뷰 관리
            </S.Breadcrumb>

            <S.Title>리뷰 관리</S.Title>

            <S.SearchBar>
                <S.SearchIcon>🔍</S.SearchIcon>
                <S.SearchInput
                    type="text"
                    placeholder="검색어를 입력해주세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </S.SearchBar>

            {filteredReviews.length === 0 ? (
                <S.EmptyMessage>
                    {searchTerm ? '검색 결과가 없습니다.' : '작성한 리뷰가 없습니다.'}
                </S.EmptyMessage>
            ) : (
                <>
                    <S.ReviewGrid>
                        {filteredReviews.map((review) => (

                            <S.ReviewCard
                                key={review.reviewNo}
                                onClick={() => navigate(`/reviews/${review.reviewNo}`)}
                            >
                                <S.ReviewImage
                                    src={review.thumbnail || '/NoPicture.jpg'}
                                    alt={review.reviewTitle}
                                    onError={(e) => {
                                        e.target.src = '/NoPicture.jpg';
                                    }}
                                />
                                <S.ReviewContent>
                                    <S.ReviewTitle>{review.reviewTitle}</S.ReviewTitle>
                                    <S.ReviewStats>
                                        <S.StatItem>
                                            <S.HeartIcon>❤️</S.HeartIcon>
                                            {review.likes || 0}
                                        </S.StatItem>
                                        <S.StatItem>
                                            <S.ViewIcon>👁️</S.ViewIcon>
                                            {review.viewCount || 0}
                                        </S.StatItem>
                                    </S.ReviewStats>
                                </S.ReviewContent>
                            </S.ReviewCard>
                        ))}
                    </S.ReviewGrid>

                    {pageInfo.maxPage > 1 && (
                        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
                    )}
                </>
            )}
        </S.ReviewManagementContainer>
    );
};

export default ReviewManagement;