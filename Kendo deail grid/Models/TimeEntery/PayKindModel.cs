using System;

namespace Kendo_deail_grid.Models.TimeEntery
{
    /// <summary>
    /// This will be used to hold information about the paykind
    /// </summary>
    public class PayKindModel
    {
        #region Public properties
        
        public Guid PolicyId
        {
            get { return Guid.NewGuid(); }
        }

        public string Name
        {
            get { return "Rr"; }
        }

        public int? MaximumMinutes
        {
            get { return 15; }
        }

        public short Index
        {
            get { return 0; }
        }
        
        #endregion

        #region Private properties
        
        
        
        #endregion

        #region Constructor
        public PayKindModel()
        {
            
        }
        #endregion
    }
}