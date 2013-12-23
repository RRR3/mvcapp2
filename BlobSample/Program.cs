using BlobSample.Impl;
using System;

namespace BlobSample
{
    class Program
    {
        static void Main(string[] args)
        {
            var blobstorage = new BaseBlobStorage("UseDevelopmentStorage=true");

            var random = new Random();
            int randomNumber = random.Next(0, 100);
            var fileName = randomNumber + ".txt";

            var blob = new TextBlob { Content = "This is a sample text", Name = fileName, Path = "BlobSample" };
            blobstorage.Put(blob);


        }
    }
}
