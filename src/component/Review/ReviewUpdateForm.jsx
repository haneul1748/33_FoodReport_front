import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, X , Home, ChevronRight } from 'lucide-react';
import {
  Container, FormTitle, FormGroup, Label, Input, EditorContainer, Toolbar,
  ToolbarButton, TextArea, ImageSection, ImageGrid, ImageWrapper,
  RemoveImageButton, UploadPlaceholder, Tag,
  ButtonGroup, SubmitButton, CancelButton,
  Breadcrumb,
  TagContainer,
  SectionTitle,
  Region,
  CategorySection
} from './ReviewUpdateForm.style.js';
import { authInstance, publicInstance } from '../api/reqService.js';
import Toast from '../common/Toast/Toast.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const ReviewUpdateForm = () => {
  const showToast = useContext(ToastContext);

  const { reviewNo } = useParams();

  const navi = useNavigate();

  // 상태 관리 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previews, setPreviews] = useState([]);
  const [deletedImageNos, setDeletedImageNos] = useState([]);
  const [activeTag, setActiveTag] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);

  const [tags, setTags] = useState([]);

  const [regions, setRegions] = useState([]);

  useEffect(() => {

    publicInstance.get(`/api/reviews/${reviewNo}`)
        .then((res) => {
          setTitle(res.data.data.reviewTitle);
          setContent(res.data.data.reviewContent);
          setActiveRegion(res.data.data.region);
          setPreviews(res.data.data.reviewImages?.map(image => ({
            imageNo : image?.imageNo,
            file : null,
            url : image?.changeName})));
          setActiveTag(res.data.data.tags);
        }).catch((err) => {
          navi('/errorpage', {state : { code: err.response.data.status , message : err.response.data.message} });
        })


        publicInstance.get(`/api/global/tags`)
            .then((res) => {
                setTags(res.data.data);
            }).catch((err) => {
                navi('/errorpage', {state : { code: err.response.data.status , message : err.response.data.message} });
            })

        publicInstance.get(`/api/global/regions`)
            .then((res) => {
                setRegions(res.data.data);
            }).catch((err) => {
                navi('/errorpage', {state : { code: err.response.data.status , message : err.response.data.message} });
            })
    

  }, []);
  


  // 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      imageNo: null,               
      file: file,                  
      url: URL.createObjectURL(file)
    }));
  
    setPreviews(prev => [...prev, ...newItems]);

    e.target.value = "";

  };

  const removeImage = (index, imageNo) => {
    if (imageNo) {
      setDeletedImageNos(prev => [...prev, imageNo]);
    }
    
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = () => {

    if(title.trim() === '' ){
      showToast({message : '제목을 작성해주십시오.'});
      return;
    }

    if(content.trim() === ''){
      showToast({message : '내용을 작성해주십시오.'});
      return;
    }

    const formData = new FormData();
    formData.append('reviewTitle', title);
    formData.append('reviewContent', content);
    
    if(activeRegion?.regionNo) {
    formData.append('regionNo', activeRegion.regionNo);
    }

    if(activeTag && activeTag.length > 0) {
    activeTag.forEach(tag => formData.append('tagNums', tag.tagNo) );
    }

    if (deletedImageNos.length > 0) {
      deletedImageNos.forEach(num => {
        formData.append('deleteImageNums', num);
      });
    }

    const newFiles = previews.filter(item => item.file !== null);
    if (newFiles.length > 0) {
      newFiles.forEach(item => {
        formData.append('images', item.file);
      });
    }

    authInstance.put(`/api/reviews/${reviewNo}`, formData, {
      headers : {
        "Content-Type" : "multipart/form-data"
      }
    })
    .then((res) => {
      showToast({message : '게시글 수정에 성공했습니다.', type : 'success'});
      navi('/reviews');
    }).catch((err) => {
      navi('/errorpage', {state : { code: err.response.data.status , message : err.response.data.message} });
    })

  };

    const handleActiveTag = (e) => {
        const filtered = activeTag.filter((tag) => tag.tagNo !== e.tagNo);

        setActiveTag(filtered.length < activeTag.length ? filtered : [...activeTag, e]);
    }

    const handleActiveRegion = (e) => {
        setActiveRegion(activeRegion === e ? null : e);
    }

  return (
    <Container>
            <Breadcrumb>
                <div className="link-item" onClick={() => navi('/')}>
                    <Home size={14} />
                </div>
                <ChevronRight size={12} />
                <div className="link-item" onClick={() => navi('/reviews')}>
                    리뷰 목록
                </div>
                <ChevronRight size={12} />
                <span>리뷰 수정</span>
            </Breadcrumb>

      <FormTitle>리뷰 수정</FormTitle>

      <FormGroup>
        <Label>제목</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          reviewholder="제목을 입력해주세요." 
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>내용</Label>
        <EditorContainer>
          <Toolbar>

            <ToolbarButton as="label">
              <ImageIcon size={18} />
              <input type="file" multiple hidden onChange={handleImageChange} />
            </ToolbarButton>
            </Toolbar>
          <TextArea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            reviewholder="장소에 대한 설명을 입력해주세요." 
            required
          />
        </EditorContainer>
      </FormGroup>

      <ImageSection>
        <Label style={{ textAlign: 'center', marginBottom: '20px' }}>이미지 미리보기</Label>
        <ImageGrid>
          {previews.map((item, index) => (
            <ImageWrapper key={index}>
              <img src={item.url} alt="preview" />
              <RemoveImageButton onClick={() => removeImage(index, item.imageNo)}><X size={14} /></RemoveImageButton>
            </ImageWrapper>
          ))}
          <UploadPlaceholder as="label">
            <input type="file" multiple hidden onChange={handleImageChange} />
            <ImageIcon size={24} />
            <span>사진 추가</span>
          </UploadPlaceholder>
        </ImageGrid>
      </ImageSection>

            <CategorySection>
                <SectionTitle>해시태그</SectionTitle>
                <TagContainer>
                    {Array.isArray(tags) && tags.map((tag, index) => (
                        <Tag
                            key={index}
                            $active={activeTag.filter(active => (active.tagNo === tag.tagNo)).length > 0}
                            onClick={() => handleActiveTag(tag)}
                            data-tooltip={tag.tagContent || "설명이 없습니다."}
                        >
                            #{tag.tagTitle}
                        </Tag>
                    ))}
                </TagContainer>
                <SectionTitle>지역</SectionTitle>
                <TagContainer>
                    {Array.isArray(regions) && regions.map((region, index) => (
                        <Region
                            key={index}
                            $active={region?.regionNo === activeRegion?.regionNo}
                            onClick={() => handleActiveRegion(region)}
                        >
                            {region.regionName}
                        </Region>
                    ))}
                </TagContainer>
            </CategorySection>


      <ButtonGroup>
        <SubmitButton onClick={handleUpdateSubmit}>작성</SubmitButton>
        <CancelButton onClick={() => navi(-1)}>취소</CancelButton>
      </ButtonGroup>
    </Container>
  );
};

export default ReviewUpdateForm;