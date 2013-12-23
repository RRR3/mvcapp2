using System.Collections.Generic;
using BlobSample.Impl;

namespace BlobSample.Interfaces
{
    public interface IBlobStorage
    {
        void Put<T>(BaseBlob<T> blobData);
        void Get<T>(BaseBlob<T> blobData);
        void Delete<T>(BaseBlob<T> blobData);
        void CopyFrom<T>(BaseBlob<T> sourceBlob);
        Dictionary<string, string> GetMetadata<T>(BaseBlob<T> blobData);
    }
}
