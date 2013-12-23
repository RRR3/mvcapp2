using System;
using System.Collections.Generic;
using BlobSample.Interfaces;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace BlobSample.Impl
{
    public class BaseBlobStorage : IBlobStorage
    {
        protected readonly CloudBlobClient BlobClient;
        public BaseBlobStorage(string connectionString)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);
            BlobClient = storageAccount.CreateCloudBlobClient();
        }

        public virtual void Put<T>(BaseBlob<T> blobData)
        {
            var blob = GetBlob(blobData);
            blob.UploadFromStream(blobData.ContentStream);
        }

        public virtual void Get<T>(BaseBlob<T> blobData)
        {
            throw new NotImplementedException();
        }

        public virtual void Delete<T>(BaseBlob<T> blobData)
        {
            throw new NotImplementedException();
        }

        public virtual void CopyFrom<T>(BaseBlob<T> sourceBlob)
        {
            throw new NotImplementedException();
        }

        public Dictionary<string, string> GetMetadata<T>(BaseBlob<T> blobData)
        {
            throw new NotImplementedException();
        }

        private CloudBlockBlob GetBlob<T>(BaseBlob<T> blobData)
        {
            var container = GetContainer(blobData);
            CloudBlockBlob blob = container.GetBlockBlobReference(blobData.Name);
            return blob;
        }

        private CloudBlobContainer GetContainer<T>(BaseBlob<T> blobData)
        {
            var containerName = blobData.Path.ToLower();
            CloudBlobContainer container = BlobClient.GetContainerReference(containerName);
            container.CreateIfNotExists();
            return container;
        }
    }
}
