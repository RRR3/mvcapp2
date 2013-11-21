
namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This model will have configuration options required to create timeentry grid.
    /// </summary>
    public class ControlConfiguration
    {


        #region Public properties
        
        public bool ShowProjectColumn { get; set; }
        
        public bool ShowStatusColumn { get; set; }
        
        public bool ShowReasonColumn { get; set; }
        
        public bool CreateStatusRow { get; set; }
        
        public bool ShowEmployeeList { get; set; }
        
        #endregion

        #region Constructor
      
        public ControlConfiguration()
        {
            ShowProjectColumn = true;
            ShowStatusColumn = ShowReasonColumn = false;
            CreateStatusRow = true;
            ShowEmployeeList = true;
        }
        #endregion
    }
}