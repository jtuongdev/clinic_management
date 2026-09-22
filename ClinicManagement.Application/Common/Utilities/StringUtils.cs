using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace ClinicManagement.Application.Common.Utilities;

public static class StringUtils
{
    private static readonly Regex MultipleSpacesRegex = new(@"\s+", RegexOptions.Compiled);

    /// <summary>
    /// Loại bỏ toàn bộ dấu tiếng Việt và chuyển ký tự đ/Đ thành d/D
    /// </summary>
    public static string RemoveDiacritics(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalizedString.Length);

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        var result = sb.ToString().Normalize(NormalizationForm.FormC);

        // Xử lý riêng ký tự đ / Đ trong tiếng Việt
        result = result.Replace('đ', 'd').Replace('Đ', 'D');

        return MultipleSpacesRegex.Replace(result.Trim(), " ");
    }

    /// <summary>
    /// Chuẩn hóa từ khóa tìm kiếm: viết thường, bỏ dấu và cắt khoảng trắng thừa
    /// </summary>
    public static string NormalizeSearchKeyword(string? keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return string.Empty;

        return RemoveDiacritics(keyword).ToLowerInvariant();
    }
}
