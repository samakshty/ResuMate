from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
from PIL import Image
import pytesseract
import os
import io
import logging
import traceback # For detailed error logging

# Set up logging
logging.basicConfig(level=logging.DEBUG) # Use DEBUG for development
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Allow all origins for simplicity during development
CORS(app, resources={r"/analyze": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Checks if the filename has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    """Extracts text from a PDF file."""
    try:
        text = ''
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n' # Add newline between pages
        if not text.strip():
            logger.warning(f"No text could be extracted from PDF: {filepath}")
            # Return specific error message for clarity
            return {"error": "No text content found in the PDF."}
        logger.info(f"Successfully extracted text from PDF: {filepath}")
        return text
    except Exception as e:
        logger.error(f"PDF extraction error for {filepath}: {str(e)}")
        logger.error(traceback.format_exc()) # Log full traceback
        # Return specific error message
        return {"error": f"Failed to process PDF file: {str(e)}"}

def extract_text_from_image(filepath):
    """Extracts text from an image file using Tesseract."""
    try:
        # You might need to specify the Tesseract path if it's not in your system's PATH
        # pytesseract.pytesseract.tesseract_cmd = r'/path/to/your/tesseract'
        text = pytesseract.image_to_string(Image.open(filepath))
        if not text.strip():
            logger.warning(f"No text could be extracted from image: {filepath}")
            return {"error": "No text content recognized in the image."}
        logger.info(f"Successfully extracted text from image: {filepath}")
        return text
    except Exception as e:
        logger.error(f"Image extraction error for {filepath}: {str(e)}")
        logger.error(traceback.format_exc()) # Log full traceback
        return {"error": f"Failed to process image file: {str(e)}"}

def parse_resume(text_content):
    """Parses the extracted text to find name, email, and skills."""
    # Check if input is an error dictionary from extraction
    if isinstance(text_content, dict) and 'error' in text_content:
        logger.warning(f"Parsing skipped due to extraction error: {text_content['error']}")
        return text_content # Pass the extraction error through

    # Basic check for valid text input
    if not isinstance(text_content, str) or not text_content.strip():
        logger.warning("Parsing failed: No valid text provided.")
        return {"error": "No text provided or text is invalid."}

    try:
        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        if not lines:
            logger.warning("Parsing failed: Text contains no non-empty lines.")
            return {"error": "Text contains no content after stripping whitespace."}

        # Very basic name finding (first line)
        name = lines[0]

        # Basic email finding
        email = "No email found"
        for line in lines:
            # Simple check for '@' and '.' after '@'
            if '@' in line and '.' in line.split('@')[-1]:
                # Further refinement could be added here (e.g., regex)
                email = line # Use the whole line for simplicity, or extract precisely
                break # Take the first found email

        # Basic skills finding
        common_skills = [
            'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin',
            'html', 'css', 'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring',
            'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'aws', 'azure', 'gcp', 'cloud',
            'docker', 'kubernetes', 'git', 'linux', 'machine learning', 'ai', 'data science',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
        ]
        text_lower = text_content.lower()
        # Use word boundaries for slightly better matching
        skills = [skill for skill in common_skills if f' {skill} ' in f' {text_lower} ' or f'\n{skill} ' in f'\n{text_lower} ' or f' {skill}\n' in f' {text_lower}\n']
        # Handle cases where skill might be at the very start/end or punctuation attached
        # This simple check misses many cases but is a basic start. More robust regex is better.


        result = {
            "name": name,
            "email": email,
            "skills": sorted(list(set(skills))), # Unique & sorted
            "raw_text": text_content[:1500]  # Slightly larger preview
        }

        logger.info(f"Successfully parsed resume. Name: {name}, Email: {email}, Skills Found: {len(skills)}")
        return result
    except Exception as e:
        logger.error(f"Resume parsing error: {str(e)}")
        logger.error(traceback.format_exc()) # Log full traceback
        return {"error": f"An error occurred during text parsing: {str(e)}"}

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """Endpoint to handle resume analysis from file upload or text input."""
    filepath = None  # Initialize filepath to None
    text_to_parse = None
    logger.debug(f"Request headers: {request.headers}")
    logger.debug(f"Request form data: {request.form}")
    logger.debug(f"Request files: {request.files}")

    try:
        # Handle direct text input FIRST
        if 'text' in request.form:
            logger.info("Processing text input")
            text_input = request.form['text']
            if not text_input or not text_input.strip():
                logger.warning("Received empty text input.")
                return jsonify({"error": "Empty text provided"}), 400
            text_to_parse = text_input

        # Handle file upload SECOND
        elif 'file' in request.files:
            logger.info("Processing file input")
            file = request.files['file']

            if file.filename == '':
                logger.warning("No file selected (empty filename).")
                return jsonify({"error": "No file selected"}), 400

            if not allowed_file(file.filename):
                logger.warning(f"Invalid file type attempted: {file.filename}")
                allowed_types = ", ".join(ALLOWED_EXTENSIONS)
                return jsonify({"error": f"File type not allowed. Please upload: {allowed_types}"}), 400

            # Save file temporarily
            # Consider adding unique identifiers to filename to prevent conflicts
            # e.g., filename = secure_filename(file.filename) # Needs import from werkzeug.utils
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            try:
                file.save(filepath)
                logger.info(f"File saved temporarily: {filepath}")
            except Exception as save_err:
                 logger.error(f"Error saving file {filepath}: {save_err}")
                 return jsonify({"error": f"Could not save uploaded file: {save_err}"}), 500


            # Extract text based on file type
            if file.filename.lower().endswith('.pdf'):
                text_to_parse = extract_text_from_pdf(filepath)
            else: # Handle images (png, jpg, jpeg)
                text_to_parse = extract_text_from_image(filepath)

        else:
            logger.warning("Request received without 'text' or 'file' part.")
            return jsonify({"error": "No file or text provided in the request"}), 400

        # --- Parsing ---
        # Now parse the text (either from file or direct input)
        analysis_result = parse_resume(text_to_parse)

        # Check if parsing or extraction returned an error dictionary
        if isinstance(analysis_result, dict) and 'error' in analysis_result:
            logger.error(f"Analysis failed: {analysis_result['error']}")
            # Return 400 for client-side errors (bad file, bad text), 500 for server issues
            status_code = 400 if "process" not in analysis_result['error'].lower() else 500
            return jsonify(analysis_result), status_code

        # If successful
        logger.info("Analysis successful.")
        return jsonify(analysis_result), 200

    except Exception as e:
        # Catch-all for unexpected errors
        error_msg = str(e)
        logger.error(f"Unexpected error in /analyze endpoint: {error_msg}")
        logger.error(traceback.format_exc()) # Log full traceback
        return jsonify({"error": f"An unexpected server error occurred: {error_msg}"}), 500

    finally:
        # Clean up the temporary file if it exists, regardless of errors
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                logger.info(f"Temporary file cleaned up: {filepath}")
            except Exception as clean_err:
                logger.error(f"Error removing temporary file {filepath}: {clean_err}")


if __name__ == '__main__':
    logger.info("Starting simplified Flask server...")
    # Consider using a different port like 5001 if 5178 is problematic
    app.run(host='0.0.0.0', port=5178, debug=True)