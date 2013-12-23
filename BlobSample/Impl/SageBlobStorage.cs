using System;

namespace BlobSample.Impl
{
    public class SageBlobStorage : BaseBlobStorage
    {
        private Guid _tenantId;
        private Guid _contextId;
        private Guid _blobContentTypeId;

        //The parameter list is just an indication, this not final. This can be replaced with Context and/or FileInformation style implementation
        public SageBlobStorage(string connectionString, Guid tenantId, Guid contextId, Guid blobContentTypeId) : base(connectionString)
        {
            _tenantId = tenantId;
            _contextId = contextId;
            _blobContentTypeId = blobContentTypeId;
        }

        public override void Put<T>(BaseBlob<T> blobData)
        {
            blobData.Path = GetContainerName(blobData);
            base.Put(blobData);
        }
        public override void Get<T>(BaseBlob<T> blobData)
        {
            blobData.Path = GetContainerName(blobData);
            base.Get(blobData);
        }


        public override void Delete<T>(BaseBlob<T> blobData)
        {
            blobData.Path = GetContainerName(blobData);
            base.Delete(blobData);
        }

        public override void CopyFrom<T>(BaseBlob<T> sourceBlob)
        {
            //Need to think about this.
            sourceBlob.Path = GetContainerName(sourceBlob);
            base.CopyFrom(sourceBlob);
        }

        protected virtual string GetContainerName<T>(BaseBlob<T> blobData)
        {
            return blobData.Path;
        }
    }
}
