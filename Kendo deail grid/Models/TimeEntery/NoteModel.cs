using System.ComponentModel.DataAnnotations;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This will be used to hold the line level/day note
    /// </summary>
    public class NoteModel
    {
        
        #region Public properties

        
        public string Note { get; set; }

        #endregion

        #region Constructor

        public NoteModel()
        {
            
        }
        /// <summary>
        /// NoteModel
        /// </summary>
        /// <param name="note"></param>
        public NoteModel(string note)
        {
            Note = !string.IsNullOrEmpty(note) ? note : string.Empty;
        }

        #endregion
    }
}