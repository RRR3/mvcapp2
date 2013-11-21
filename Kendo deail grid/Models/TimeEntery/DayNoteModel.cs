using System;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This will have information about the day note.
    /// </summary>
    public class DayNoteModel : NoteModel
    {
        #region Public properties
        
        public Guid TimeEntryId { get; set; }
        
        public string TimeEntryDateString { get; set; }
        
        #endregion

        #region Constructor

        public DayNoteModel()
        {
            //TimeEntryId = timeEntry.Id;
            //TimeEntryDateString = timeEntry.EntryDate.ToShortDateString();
            //Note = timeEntry.Note;
        }
        
        #endregion
    }
}