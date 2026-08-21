$src = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class IconGen {
    public static void Create(string outPath, int size) {
        using (var bmp = new Bitmap(size, size)) {
            using (var g = Graphics.FromImage(bmp)) {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;

                var bg = new Rectangle(36, 36, size - 72, size - 72);
                var outer = new Rectangle(24, 24, size - 48, size - 48);
                using (var bgBrush = new LinearGradientBrush(outer, Color.FromArgb(124, 58, 237), Color.FromArgb(91, 33, 182), 45f))
                using (var shadowBrush = new SolidBrush(Color.FromArgb(20, 10, 40)))
                using (var glossBrush = new SolidBrush(Color.FromArgb(70, 255, 255, 255)))
                using (var vignetteBrush = new SolidBrush(Color.FromArgb(60, 0, 0, 0)))
                {
                    g.FillRoundedRectangle(bgBrush, bg, 180);
                    g.FillRoundedRectangle(shadowBrush, new Rectangle(40, 40, size - 80, size - 80), 180);
                    using (var overlay = new GraphicsPath()) {
                        overlay.AddEllipse(new Rectangle(0, 0, size, size));
                        using (var pathBrush = new PathGradientBrush(overlay)) {
                            pathBrush.CenterColor = Color.FromArgb(0, 0, 0, 0);
                            pathBrush.SurroundColors = new[]{ Color.FromArgb(70, 0, 0, 0) };
                            pathBrush.CenterPoint = new PointF(size * 0.5f, size * 0.5f);
                            g.FillEllipse(new SolidBrush(Color.FromArgb(0, 0, 0, 0)), 0, 0, size, size);
                        }
                    }
                    g.FillRoundedRectangle(new SolidBrush(Color.FromArgb(18, 255, 255, 255)), new Rectangle(40, 40, size - 80, size - 80), 180);
                    g.FillEllipse(glossBrush, new Rectangle(-40, -40, size * 0.62f, size * 0.62f));
                    g.FillEllipse(new SolidBrush(Color.FromArgb(20, 255, 255, 255)), new Rectangle(size / 2 - 150, size / 2 - 150, 300, 300));
                }

                var ticketRect = new RectangleF(size * 0.22f, size * 0.28f, size * 0.56f, size * 0.44f);
                var ticketShadow = new RectangleF(size * 0.24f + 12, size * 0.30f + 14, size * 0.56f, size * 0.44f);
                using (var shadowBrush = new SolidBrush(Color.FromArgb(80, 30, 10, 80))) {
                    g.TranslateTransform(0, 0);
                    g.FillRoundedRectangle(shadowBrush, ticketShadow, 70);
                }

                g.TranslateTransform(size / 2f, size / 2f);
                g.RotateTransform(20f);
                g.TranslateTransform(-size / 2f, -size / 2f);

                using (var ticketBrush = new LinearGradientBrush(new RectangleF(ticketRect.Left, ticketRect.Top, ticketRect.Width, ticketRect.Height), Color.FromArgb(255, 255, 255), Color.FromArgb(248, 246, 255), 90f))
                using (var borderBrush = new Pen(Color.FromArgb(190, 217, 200, 255), 12f))
                using (var accentBrush = new Pen(Color.FromArgb(180, 205, 184, 255), 10f)) {
                    g.FillRoundedRectangle(ticketBrush, ticketRect, 70);
                    g.DrawRoundedRectangle(borderBrush, ticketRect, 70);
                    g.DrawRoundedRectangle(accentBrush, new RectangleF(ticketRect.Left + 18, ticketRect.Top + 16, ticketRect.Width - 36, ticketRect.Height - 32), 54);
                    using (var notchBrush = new SolidBrush(Color.FromArgb(120, 205, 184, 255))) {
                        g.FillEllipse(notchBrush, ticketRect.Left + 14, ticketRect.Top + 50, 18, 18);
                        g.FillEllipse(notchBrush, ticketRect.Left + 14, ticketRect.Bottom - 68, 18, 18);
                        g.FillEllipse(notchBrush, ticketRect.Right - 32, ticketRect.Top + 50, 18, 18);
                        g.FillEllipse(notchBrush, ticketRect.Right - 32, ticketRect.Bottom - 68, 18, 18);
                    }
                }

                using (var glowBrush = new SolidBrush(Color.FromArgb(50, 255, 213, 74))) {
                    g.FillEllipse(glowBrush, size * 0.35f, size * 0.34f, size * 0.30f, size * 0.30f);
                }

                var starPoints = new PointF[] {
                    new PointF(size * 0.5f, size * 0.33f),
                    new PointF(size * 0.54f, size * 0.43f),
                    new PointF(size * 0.66f, size * 0.43f),
                    new PointF(size * 0.56f, size * 0.50f),
                    new PointF(size * 0.60f, size * 0.62f),
                    new PointF(size * 0.50f, size * 0.55f),
                    new PointF(size * 0.40f, size * 0.62f),
                    new PointF(size * 0.44f, size * 0.50f),
                    new PointF(size * 0.34f, size * 0.43f),
                    new PointF(size * 0.46f, size * 0.43f)
                };
                using (var starBrush = new LinearGradientBrush(new RectangleF(size * 0.31f, size * 0.31f, size * 0.38f, size * 0.38f), Color.FromArgb(255, 213, 74), Color.FromArgb(244, 180, 0), 45f))
                using (var starPen = new Pen(Color.FromArgb(200, 244, 180, 0), 8f))
                using (var innerShadowPen = new Pen(Color.FromArgb(70, 80, 30, 0), 12f)) {
                    g.FillPolygon(starBrush, starPoints);
                    g.DrawPolygon(starPen, starPoints);
                    g.DrawPolygon(innerShadowPen, starPoints);
                }

                using (var whiteBrush = new SolidBrush(Color.FromArgb(120, 255, 255, 255))) {
                    g.FillEllipse(whiteBrush, size * 0.32f, size * 0.30f, size * 0.08f, size * 0.08f);
                }

                using (var sparkBrush = new SolidBrush(Color.FromArgb(220, 255, 244, 180))) {
                    DrawStar(g, sparkBrush, new PointF(size * 0.25f, size * 0.22f), 10f, 5, 0.55f);
                    DrawStar(g, sparkBrush, new PointF(size * 0.77f, size * 0.80f), 8f, 5, 0.55f);
                }

                using (var glossBrush = new SolidBrush(Color.FromArgb(90, 255, 255, 255))) {
                    var path = new GraphicsPath();
                    path.AddArc(new RectangleF(ticketRect.Left + 24, ticketRect.Top + 26, ticketRect.Width - 70, ticketRect.Height - 70), 180f, 90f);
                    path.AddLine(ticketRect.Left + 24, ticketRect.Top + 26, ticketRect.Left + 24, ticketRect.Top + 26);
                    g.FillPath(glossBrush, path);
                }

                using (var highlightPen = new Pen(Color.FromArgb(160, 255, 255, 255), 8f)) {
                    g.DrawArc(highlightPen, new RectangleF(ticketRect.Left + 24, ticketRect.Top + 24, ticketRect.Width - 52, ticketRect.Height - 52), 200f, 100f);
                }
            }
            bmp.Save(outPath, ImageFormat.Png);
        }
    }

    private static void FillRoundedRectangle(this Graphics g, Brush brush, RectangleF rect, float radius) {
        using (var path = RoundedRect(rect, radius)) {
            g.FillPath(brush, path);
        }
    }

    private static void DrawRoundedRectangle(this Graphics g, Pen pen, RectangleF rect, float radius) {
        using (var path = RoundedRect(rect, radius)) {
            g.DrawPath(pen, path);
        }
    }

    private static GraphicsPath RoundedRect(RectangleF rect, float radius) {
        var path = new GraphicsPath();
        float diameter = radius * 2f;
        path.AddArc(rect.X, rect.Y, diameter, diameter, 180f, 90f);
        path.AddArc(rect.Right - diameter, rect.Y, diameter, diameter, 270f, 90f);
        path.AddArc(rect.Right - diameter, rect.Bottom - diameter, diameter, diameter, 0f, 90f);
        path.AddArc(rect.X, rect.Bottom - diameter, diameter, diameter, 90f, 90f);
        path.CloseFigure();
        return path;
    }

    private static void DrawStar(Graphics g, Brush brush, PointF center, float radius, int points, double innerRatio) {
        var pts = new PointF[points * 2];
        for (int i = 0; i < points * 2; i++) {
            double angle = (Math.PI / points) * i - Math.PI / 2d;
            float r = i % 2 == 0 ? radius : (float)(radius * innerRatio);
            pts[i] = new PointF(center.X + (float)(Math.Cos(angle) * r), center.Y + (float)(Math.Sin(angle) * r));
        }
        g.FillPolygon(brush, pts);
    }
}
'@

$scriptPath = Join-Path $PWD 'gen_icon.ps1'
Set-Content -Path $scriptPath -Value $src -Encoding UTF8
$code = @"
Add-Type -TypeDefinition @'
$src
'@ -ReferencedAssemblies System.Drawing
[IconGen]::Create('$PWD/festivo_icon_1024.png', 1024)
"@
$code | powershell -NoProfile -Command -
