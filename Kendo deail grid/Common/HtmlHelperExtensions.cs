
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace Kendo_deail_grid.Common
{
    public static class HtmlHelperExtensions 
    {


        public static MvcHtmlString ConvertToJsVariable(this HtmlHelper hh, string varName, object thingToConvert)
        {
            string js = string.Format("var {0} = {1};", varName, new JavaScriptSerializer().Serialize(thingToConvert));
            return MvcHtmlString.Create(js);
        }


    }
}
