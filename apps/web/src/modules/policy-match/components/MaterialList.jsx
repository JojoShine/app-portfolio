import PropTypes from 'prop-types';
import {ImageUploader} from 'antd-mobile';
import {AddOutline} from 'antd-mobile-icons';
import {useMaterialImage} from '../hooks/useApplication';
function MaterialItem({requirement,attached,onUpload,onPreview,busy}){
  const isImage=attached&&['image/jpeg','image/png'].includes(attached.file.mimeType);
  const image=useMaterialImage(isImage?attached.fileId:null,onUpload?file=>onUpload(requirement.code,file):null);
  return <section className="pm-card pm-material-card">
    <div className="pm-material-card-copy"><h3>{requirement.name}<small className="pm-required">{requirement.required?'必需':'选填'}</small></h3><p className="pm-muted">仅支持 JPG、PNG 图片，每张不超过 10MB</p></div>
    <ImageUploader value={image.value} onChange={image.onChange} upload={image.upload} accept="image/jpeg,image/png" multiple={false} maxCount={2} deletable={false} showUpload={Boolean(onUpload)} disableUpload={busy} showFailed={false} style={{'--cell-size':'88px','--gap':'12px'}}>
      <div className="pm-image-upload-add" role="img" aria-label={(attached?'替换':'上传')+requirement.name}><AddOutline/><span>{attached?'替换图片':'上传图片'}</span></div>
    </ImageUploader>
    {image.error&&<p className="pm-upload-error" role="alert">{image.error}</p>}
    {attached&&!isImage&&<p className="pm-upload-error">原材料不是图片，请替换后继续。<button type="button" onClick={()=>onPreview(attached.fileId)}>查看原材料</button></p>}
    {!onUpload&&!attached&&<p className="pm-muted">未上传</p>}
  </section>;
}
MaterialItem.propTypes={requirement:PropTypes.object.isRequired,attached:PropTypes.object,onUpload:PropTypes.func,onPreview:PropTypes.func.isRequired,busy:PropTypes.bool};
export default function MaterialList({requirements,materials,onUpload,onPreview,busy=false}){
  return <div className="pm-upload-list">{requirements.map(requirement=><MaterialItem key={requirement.code} requirement={requirement} attached={materials.find(item=>item.code===requirement.code)} onUpload={onUpload} onPreview={onPreview} busy={busy}/>)}</div>;
}
MaterialList.propTypes={requirements:PropTypes.array.isRequired,materials:PropTypes.array.isRequired,onUpload:PropTypes.func,onPreview:PropTypes.func.isRequired,busy:PropTypes.bool};
