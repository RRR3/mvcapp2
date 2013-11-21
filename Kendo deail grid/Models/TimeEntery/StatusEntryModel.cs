using System;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This model will be used for time entry line item.
    /// </summary>
    public class StatusEntryModel
    {
        #region Public properties
        
        public Guid TimeEntryId { get; set; }
        
        public Guid TimeEntryStatusEntryId { get; set; }
        
        public DateTime TimeEntryDate { get; set; }
        
        public string TimeEntryDateString { get; set; }
        
        public int Status { get; set; }
        
        public Guid ProjectId { get; set; }
        
        public string ProjectName { get; set; }
        
        public Guid SubjobId { get; set; }
        
        public string SubjobName { get; set; }
        
        public Guid CostCodeId { get; set; }
        
        public string CostCodeName { get; set; }
        
        public Guid PayKindId { get; set; }
        
        public string PayKindName { get; set; }
        
        public decimal Hours { get; set; }
        
        public string Reason { get; set; }
        
        public NoteModel Note { get; set; }
        
        public bool IsNew { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public bool IsEditable { get; set; }
        
        #endregion

        #region Constructor

        public StatusEntryModel()
        {
            
        }
        #endregion
    }
}