import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from './ReviewInsertForm.style.js';
import { authInstance, publicInstance } from '../api/reqService.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const ReviewInsertForm = () => {
  const showToast = useContext(ToastContext);
  const { auth } = useContext(AuthContext);

  const navi = useNavigate();

  // 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeTag, setActiveTag] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);

  const [tags, setTags] = useState([]);

  const [regions, setRegions] = useState([]);

  useEffect(() => {
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
    setImages(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    
      console.log(images);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = () => {

    if(title.trim() === ''){
      showToast({message : '제목은 비어있을 수 없습니다.'});
    }

    if(content.trim() === ''){
      showToast({message : '내용은 비어있을 수 없습니다.'});
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

    if(images && images.length > 0) {
    images.forEach(file => formData.append('images', file));
    }

    authInstance.post(`/api/reviews`, formData, {
      headers : {
        "Content-Type" : "multipart/form-data"
      }
    })
    .then((res) => {
      showToast({message : '게시글 작성에 성공하였습니다.', type : 'success'});
      navi('/reviews');
    }).catch((err) => {
      navi('/errorpage', {state : { code: err.response.data.status , message : err.response.data.message} });
    })

  };

    const handleActiveTag = (e) => {
        setActiveTag(activeTag.includes(e) ? activeTag.filter((tag) => { return tag != e }) : [...activeTag, e]);
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
                <span>리뷰 작성</span>
            </Breadcrumb>

      <FormTitle>리뷰 작성</FormTitle>

      <FormGroup>
        <Label>제목</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="제목을 입력해주세요." 
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
            placeholder="장소에 대한 설명을 입력해주세요." 
          />
        </EditorContainer>
      </FormGroup>

      <ImageSection>
        <Label style={{ textAlign: 'center', marginBottom: '20px' }}>이미지 미리보기</Label>
        <ImageGrid>
          {previews.map((src, index) => (
            <ImageWrapper key={index}>
              <img src={src} alt="preview" />
              <RemoveImageButton onClick={() => removeImage(index)}><X size={14} /></RemoveImageButton>
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
                            $active={activeTag.includes(tag)}
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
                            $active={activeRegion === region}
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

export default ReviewInsertForm;