using System;
using System.Collections.Generic;
using System.Web.Providers.Entities;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This will be used to render time entry grid.
    /// </summary>
    public class TimeDetailModel
    {
        #region Public properties
        
        /// <summary>
        /// Holds information about current selected employee. By default, for current employee.
        /// </summary>
        public EmployeeModel Employee { get; set; }

        /// <summary>
        /// Holds Day notes.
        /// </summary>
        public List<DayNoteModel> DayNotes { get; set; }

        /// <summary>
        /// List of status entries.
        /// </summary>
        public List<StatusEntryModel> StatusEntries { get; set; }

        /// <summary>
        /// Options to render detail grid.
        /// </summary>
        public ControlConfiguration Options { get; set; }

        /// <summary>
        /// Default time status for the current employee
        /// </summary>
        public int DefaultStatus { get; set; }

        /// <summary>
        /// Days in the current week.
        /// </summary>
        public List<DateInfo> WeekDays { get; set; }
        
       
        #endregion

        #region Constructor
        
        public TimeDetailModel()
        {

        }
        #endregion
    }

    public class EmployeeModel
    {
        public Guid Id { get; set; }
        public string DisplayName { get; set; }

        public EmployeeModel()
        {
            Id =  Guid.NewGuid();
            DisplayName = "HAHAHA";
        }
    }
}