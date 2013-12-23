
using System.Collections.Generic;

namespace Sage.Core.Framework.Storage
{
    public interface ITable
    {
        /// <summary>
        /// Creates a new table.
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        bool CreateTable(string tableName);

        /// <summary>
        /// Deletes a table.
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        bool DeleteTable(string tableName);

        /// <summary>
        /// Adds the specified entities into the table.
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="tableName"></param>
        /// <param name="records"></param>
        /// <returns></returns>
        bool Insert<T>(string tableName, IEnumerable<T> records);

        /// <summary>
        /// Gets a collection of entities from the specified table.
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="tableName"></param>    
        /// <returns></returns>
        List<T> Get<T>(string tableName);

    
        /// <summary>
        /// Updates the entities stored in the table.
        /// </summary>
        /// <typeparam name="T">Entity type</typeparam>
        /// <param name="tableName"></param>
        /// <param name="records"></param>
        /// <param name="allowInsert"></param>
        /// <param name="replace"></param>
        /// <returns></returns>
        bool Update<T>(string tableName, IEnumerable<T> records, bool allowInsert = true, bool replace = true);


        /// <summary>
        /// Deletes the entities stored in the table.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="tableName"></param>
        /// <param name="records"></param>
        /// <returns></returns>
        bool Delete<T>(string tableName, IEnumerable<T> records);
    }
}
