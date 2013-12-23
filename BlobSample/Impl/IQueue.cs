
namespace Sage.Core.Framework.Storage
{
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// Represents a Queue storage
    /// </summary>
    public interface IQueue
    {
        /// <summary>
        /// Enqueue a message to the queue
        /// </summary>
        /// <param name="message">Message to be enqueued</param>
        void Enqueue(IQueueMessage message);

        /// <summary>
        /// Gets a message from top of the Queue.
        /// </summary>
        /// <remarks>
        /// This action will not remove the message from queue, caller should explicitly call delete once the processing of message is complete.
        /// Once a message is dequeue it will be hidden for an hour before it is visible back in the queue.
        /// if it take longer than an hour to process the message, caller should call extend lease method to keep it hidden.
        /// </remarks>
        IQueueMessage Dequeue();

        /// <summary>
        /// Creates a storage queue message based on the payload
        /// </summary>
        /// <param name="payload">Payload</param>
        IQueueMessage CreateMessage(string payload);

        /// <summary>
        /// Add a scheduled message to the end of the queue
        /// </summary>
        /// <param name="message"></param>
        /// <param name="nextDateTime"></param>
        void ScheduledEnqueue(IQueueMessage message, DateTime nextDateTime);

	    /// <summary>
        /// Extends the lease of the message.
        /// </summary>
        /// <param name="message">Message whose lease needs to be extended</param>
        void ExtendLease(IQueueMessage message);

        /// <summary>
        /// Deletes a specific message from the queue
        /// </summary>
        /// <param name="message">Message to be deleted</param>
        void Delete(IQueueMessage message);

        /// <summary>
        /// Gets the approximate number of items in the specified queue.
        /// </summary>
        /// <returns>The approximate number of items in the queue.</returns>
        int GetCount();

        /// <summary>
        /// Clears out the entire queue.
        /// </summary>
        void Clear();
    }
}
