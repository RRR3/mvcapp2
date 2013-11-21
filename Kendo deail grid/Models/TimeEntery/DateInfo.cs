

using System;
using System.Globalization;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This will have information about the date column in the time entry grid.
    /// </summary>
    public class DateInfo
    {
        #region Public properties
        
        public string DateString { get; set; }

        public string DisplayDate { get; set; }

        public string DayOfWeek { get; set; }

        private DateTimeFormatInfo _dtfi
        {
            get { return DateTimeFormatInfo.CurrentInfo; }
        }

        #endregion

        #region Constructor

        public DateInfo(DateTime date)
        {
            DateString = date.ToShortDateString();
            DisplayDate = date.ToString("M/d");
            DayOfWeek = _dtfi.GetAbbreviatedDayName(date.DayOfWeek);
        }
        #endregion
    }
}