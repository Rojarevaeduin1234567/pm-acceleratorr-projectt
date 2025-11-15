import json
import csv
import xml.etree.ElementTree as ET
from io import StringIO, BytesIO
from typing import List, Dict
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import markdown

def export_to_json(data: List[Dict]) -> str:
    """Export data to JSON format"""
    return json.dumps(data, indent=2, default=str)

def export_to_csv(data: List[Dict]) -> str:
    """Export data to CSV format"""
    if not data:
        return ""
    
    output = StringIO()
    fieldnames = data[0].keys()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()

def export_to_xml(data: List[Dict]) -> str:
    """Export data to XML format"""
    root = ET.Element("weather_queries")
    for item in data:
        query_elem = ET.SubElement(root, "weather_query")
        for key, value in item.items():
            child = ET.SubElement(query_elem, key)
            child.text = str(value)
    
    ET.indent(root)
    return ET.tostring(root, encoding='unicode')

def export_to_pdf(data: List[Dict]) -> BytesIO:
    """Export data to PDF format"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Weather Queries Export", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    if not data:
        elements.append(Paragraph("No data to export", styles['Normal']))
    else:
        # Create table
        table_data = [['ID', 'Location', 'Date From', 'Date To', 'Temperature']]
        for item in data:
            table_data.append([
                str(item.get('id', '')),
                str(item.get('location', '')),
                str(item.get('date_from', '')),
                str(item.get('date_to', '')),
                str(item.get('output_temperature', ''))
            ])
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

def export_to_markdown(data: List[Dict]) -> str:
    """Export data to Markdown format"""
    if not data:
        return "# Weather Queries Export\n\nNo data to export.\n"
    
    md = "# Weather Queries Export\n\n"
    md += "| ID | Location | Date From | Date To | Temperature |\n"
    md += "|----|----------|-----------|---------|-------------|\n"
    
    for item in data:
        md += f"| {item.get('id', '')} | {item.get('location', '')} | "
        md += f"{item.get('date_from', '')} | {item.get('date_to', '')} | "
        md += f"{item.get('output_temperature', '')} |\n"
    
    return md

