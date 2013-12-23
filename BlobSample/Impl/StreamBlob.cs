using System.IO;

namespace BlobSample.Impl
{
    public class StreamBlob : BaseBlob<Stream>
    {
        protected internal override Stream ContentStream
        {
            get
            {
                return Content;
            }
            set
            {
                Content = value;
            }
        }
    }
}
