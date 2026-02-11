import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Paging/Pagination';
import UserAvatar from '../common/Card/UserAvatar';
import * as S from './LikesList.style';
import { authInstance } from '../api/reqService';
import { AuthContext } from '../context/AuthContext';

const LikesList = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [likeType, setLikeType] = useState('ALL');
    const [likes, setLikes] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        startPage: 1,
        endPage: 1,
        maxPage: 1
    });

    // 좋아요 목록 조회
    const fetchLikes = (page = 1, type = 'ALL') => {
        if (!auth?.accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const params = new URLSearchParams({
            page: page.toString()
        });

        if (type && type !== 'ALL') {
            params.append('likeType', type);
        }

        authInstance.get(`/api/members/likes?${params.toString()}`)
            .then((res) => {
                const data = res.data.data || res.data;

                // likeType에 따라 적절한 데이터 설정
                let likesData = [];
                if (data.likeType === 'ALL' || !data.likeType) {
                    likesData = data.allLikes || [];
                } else if (data.likeType === 'REVIEW') {
                    likesData = data.reviewLikes || [];
                } else if (data.likeType === 'REVIEW_REPLY') {
                    likesData = data.reviewReplyLikes || [];
                } else if (data.likeType === 'PLACE') {
                    likesData = data.placeLikes || [];
                } else if (data.likeType === 'PLACE_REPLY') {
                    likesData = data.placeReplyLikes || [];
                }

                setLikes(likesData);

                // pageInfo 설정
                if (data.pageInfo) {
                    setPageInfo({
                        currentPage: data.pageInfo.currentPage,
                        startPage: data.pageInfo.startPage,
                        endPage: data.pageInfo.endPage,
                        maxPage: data.pageInfo.maxPage
                    });
                }
            })
            .catch((err) => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('좋아요 목록을 불러오는데 실패했습니다.');
                }
            });
    };

    // 컴포넌트 마운트 시 조회
    useEffect(() => {
        fetchLikes(currentPage, likeType);
    }, [currentPage, likeType]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleLikeTypeChange = (type) => {
        setLikeType(type);
        setCurrentPage(1);
    };

    // 검색 필터링
    const filteredLikes = likes.filter(like => {
        const searchLower = searchTerm.toLowerCase();
        
        // ALL 타입
        if (like.title) {
            return like.title.toLowerCase().includes(searchLower) ||
                   like.content?.toLowerCase().includes(searchLower) ||
                   like.nickname?.toLowerCase().includes(searchLower);
        }
        
        // 개별 타입
        const reviewTitle = like.reviewTitle || like.placeTitle || '';
        const reviewContent = like.reviewContent || like.placeContent || like.replyContent || '';
        const nickname = like.reviewerNickname || like.placeWriterNickname || like.replyWriterNickname || '';
        
        return reviewTitle.toLowerCase().includes(searchLower) ||
               reviewContent.toLowerCase().includes(searchLower) ||
               nickname.toLowerCase().includes(searchLower);
    });

    // 좋아요 항목 클릭 핸들러
    const handleLikeClick = (like) => {
        if (likeType === 'ALL') {
            // ALL 타입
            if (like.likeType === 'REVIEW') {
                navigate(`/reviews/${like.targetNo}`);
            } else if (like.likeType === 'REVIEW_REPLY') {
                navigate(`/reviews/${like.relatedNo}`);
            } else if (like.likeType === 'PLACE') {
                navigate(`/places/${like.targetNo}`);
            } else if (like.likeType === 'PLACE_REPLY') {
                navigate(`/places/${like.relatedNo}`);
            }
        } else {
            // 개별 타입
            if (likeType === 'REVIEW') {
                navigate(`/reviews/${like.reviewNo}`);
            } else if (likeType === 'REVIEW_REPLY') {
                navigate(`/reviews/${like.reviewNo}`);
            } else if (likeType === 'PLACE') {
                navigate(`/places/${like.placeNo}`);
            } else if (likeType === 'PLACE_REPLY') {
                navigate(`/places/${like.placeNo}`);
            }
        }
    };

    // 표시할 데이터 포맷팅
    const formatLikeItem = (like) => {
        if (likeType === 'ALL') {
            return {
                title: like.title || '',
                category: like.likeType === 'REVIEW' ? '리뷰' : 
                         like.likeType === 'REVIEW_REPLY' ? '리뷰 댓글' :
                         like.likeType === 'PLACE' ? '맛집' :
                         like.likeType === 'PLACE_REPLY' ? '맛집 댓글' : '',
                author: like.nickname || '',
                likes: like.likeCount || 0,
                views: like.viewCount || 0,
                createDate: like.createDate
            };
        } else if (likeType === 'REVIEW') {
            return {
                title: like.reviewTitle || '',
                category: '리뷰',
                author: like.reviewerNickname || '',
                likes: like.reviewLikeCount || 0,
                views: like.reviewViewCount || 0,
                createDate: like.createDate
            };
        } else if (likeType === 'REVIEW_REPLY') {
            return {
                title: `${like.reviewTitle} - 댓글`,
                category: '리뷰 댓글',
                author: like.replyWriterNickname || '',
                likes: like.replyLikeCount || 0,
                views: 0,
                createDate: like.createDate
            };
        } else if (likeType === 'PLACE') {
            return {
                title: like.placeTitle || '',
                category: '맛집',
                author: like.placeWriterNickname || '',
                likes: like.placeLikeCount || 0,
                views: like.placeViewCount || 0,
                createDate: like.createDate
            };
        } else if (likeType === 'PLACE_REPLY') {
            return {
                title: `${like.placeTitle} - 댓글`,
                category: '맛집 댓글',
                author: like.replyWriterNickname || '',
                likes: like.replyLikeCount || 0,
                views: 0,
                createDate: like.createDate
            };
        }
        return {};
    };

    // 시간 계산 함수
    const getTimeAgo = (createDate) => {
        if (!createDate) return '';
        const now = new Date();
        const created = new Date(createDate);
        const diff = Math.floor((now - created) / 1000 / 60 / 60 / 24);
        
        if (diff === 0) return '오늘';
        if (diff === 1) return '1일 전';
        return `${diff}일 전`;
    };

    return (
        <S.LikesListContainer>
            <S.Breadcrumb>
                홈 & 마이페이지 & 좋아요 목록
            </S.Breadcrumb>

            <S.Title>좋아요 목록</S.Title>

            {/* 필터 버튼 */}
            <S.FilterButtons>
                <S.FilterButton 
                    active={likeType === 'ALL'} 
                    onClick={() => handleLikeTypeChange('ALL')}
                >
                    전체
                </S.FilterButton>
                <S.FilterButton 
                    active={likeType === 'REVIEW'} 
                    onClick={() => handleLikeTypeChange('REVIEW')}
                >
                    리뷰
                </S.FilterButton>
                <S.FilterButton 
                    active={likeType === 'PLACE'} 
                    onClick={() => handleLikeTypeChange('PLACE')}
                >
                    맛집
                </S.FilterButton>
                <S.FilterButton 
                    active={likeType === 'REVIEW_REPLY'} 
                    onClick={() => handleLikeTypeChange('REVIEW_REPLY')}
                >
                    리뷰 댓글
                </S.FilterButton>
                <S.FilterButton 
                    active={likeType === 'PLACE_REPLY'} 
                    onClick={() => handleLikeTypeChange('PLACE_REPLY')}
                >
                    맛집 댓글
                </S.FilterButton>
            </S.FilterButtons>

            <S.SearchBar>
                <S.SearchIcon>🔍</S.SearchIcon>
                <S.SearchInput
                    type="text"
                    placeholder="검색어를 입력해주세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </S.SearchBar>

            {filteredLikes.length === 0 ? (
                <S.EmptyMessage>
                    {searchTerm ? '검색 결과가 없습니다.' : '좋아요한 항목이 없습니다.'}
                </S.EmptyMessage>
            ) : (
                <>
                    <S.LikesList>
                        {filteredLikes.map((like, index) => {
                            const formattedItem = formatLikeItem(like);
                            return (
                                <S.LikeItem 
                                    key={index}
                                    onClick={() => handleLikeClick(like)}
                                >
                                    <S.ItemLeft>
                                        <S.AvatarWrapper>
                                            <UserAvatar src="/user.png" />
                                        </S.AvatarWrapper>
                                        <S.ItemInfo>
                                            <S.RestaurantName>
                                                {formattedItem.title}
                                                <S.Category> - {formattedItem.category}</S.Category>
                                            </S.RestaurantName>
                                            <S.MetaInfo>
                                                {formattedItem.author} {getTimeAgo(formattedItem.createDate)}
                                            </S.MetaInfo>
                                        </S.ItemInfo>
                                    </S.ItemLeft>
                                    <S.ItemRight>
                                        <S.InteractionCount>
                                            <S.HeartIcon>❤️</S.HeartIcon>
                                            {formattedItem.likes}
                                        </S.InteractionCount>
                                        {formattedItem.views > 0 && (
                                            <S.InteractionCount>
                                                <S.CommentIcon>👁️</S.CommentIcon>
                                                {formattedItem.views}
                                            </S.InteractionCount>
                                        )}
                                    </S.ItemRight>
                                </S.LikeItem>
                            );
                        })}
                    </S.LikesList>

                    {pageInfo.maxPage > 1 && (
                        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
                    )}
                </>
            )}
        </S.LikesListContainer>
    );
};

export default LikesList;