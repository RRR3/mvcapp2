using System.IO;

namespace BlobSample.Impl
{
    public abstract class BaseBlob<T>
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public T Content { get; set; }
        protected internal virtual Stream ContentStream { get; set; }

    }
}
